'use client'

import { useState, useEffect } from 'react'
import { Tag, Check, X, Sparkles, Clock, Copy, Percent, Truck, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface PromoCode {
  code: string
  description: string
  discountLabel: string
  discountValue: string
  validUntil: string
  minOrder: string | null
  type: 'percentage' | 'fixed' | 'free_delivery'
  isActive: boolean
  color: string
}

interface AppliedPromo {
  code: string
  discountLabel: string
  discountValue: string
  color: string
  type: string
}

// Confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444']
  const size = 6 + Math.random() * 6
  const startX = 30 + Math.random() * 40

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: colors[index % colors.length],
        borderRadius: index % 2 === 0 ? '50%' : '2px',
        left: `${startX}%`,
        top: '40%',
      }}
      initial={{ opacity: 1, y: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, -60 - index * 20, -120 - index * 30],
        x: [(index % 2 === 0 ? -1 : 1) * (10 + index * 5), (index % 2 === 0 ? -1 : 1) * (30 + index * 8), (index % 2 === 0 ? -1 : 1) * (50 + index * 10)],
        scale: [0, 1, 0.5],
        rotate: [0, 180 + index * 45, 360 + index * 90],
      }}
      transition={{
        duration: 1.2,
        ease: 'easeOut' as const,
      }}
    />
  )
}

export function PromoCodeWidget() {
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromos, setAppliedPromos] = useState<AppliedPromo[]>([])
  const [applyingCode, setApplyingCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successAnimation, setSuccessAnimation] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const [apiPromotions, setApiPromotions] = useState<PromoCode[]>([])
  const [isLoadingPromos, setIsLoadingPromos] = useState(true)

  const hasAppliedPromos = appliedPromos.length > 0

  // Fetch promotions from API on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      setIsLoadingPromos(true)
      try {
        const res = await fetch('/api/promotions')
        const data = await res.json()
        if (res.ok && data.promotions && data.promotions.length > 0) {
          const mapped: PromoCode[] = data.promotions.map((p: Record<string, unknown>) => ({
            code: (p.code as string) || '',
            description: (p.description as string) || (p.title as string) || '',
            discountLabel: p.type === 'PERCENTAGE' ? `${p.value}% OFF` : 
                           p.type === 'FIXED_AMOUNT' ? `R$${p.value} OFF` : 'Frete Grátis',
            discountValue: p.type === 'PERCENTAGE' ? `${p.value}%` : `R$ ${p.value}`,
            validUntil: p.endsAt ? new Date(p.endsAt as string).toLocaleDateString('pt-BR') : '',
            minOrder: p.minOrderValue ? `R$ ${(p.minOrderValue as number).toFixed(2).replace('.', ',')}` : null,
            type: p.type === 'PERCENTAGE' ? 'percentage' as const : 
                  p.type === 'FIXED_AMOUNT' ? 'fixed' as const : 'free_delivery' as const,
            isActive: p.isActive as boolean,
            color: p.type === 'PERCENTAGE' ? 'from-emerald-500 to-teal-600' :
                    p.type === 'FIXED_AMOUNT' ? 'from-amber-500 to-orange-600' :
                    'from-primary to-emerald-600',
          }))
          setApiPromotions(mapped)
        }
      } catch {
        // Silently fail — no fallback to hardcoded codes
      } finally {
        setIsLoadingPromos(false)
      }
    }
    fetchPromotions()
  }, [])

  // Only use API promotions — no hardcoded fallback
  const availablePromos = apiPromotions.filter(p => !appliedPromos.some(ap => ap.code === p.code))

  const handleApplyCode = () => {
    const code = promoInput.trim().toUpperCase()
    setError(null)
    setShakeError(false)

    if (!code) {
      setError('Digite um código promocional')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 600)
      return
    }

    if (appliedPromos.some(p => p.code === code)) {
      setError('Este cupom já foi aplicado')
      setShakeError(true)
      setTimeout(() => setShakeError(false), 600)
      return
    }

    setApplyingCode(code)

    // Validate via API
    fetch(`/api/promotions?code=${encodeURIComponent(code)}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          const promo = data.promotion
          const discountLabel = promo.type === 'PERCENTAGE' ? `${promo.value}% OFF` :
                                 promo.type === 'FIXED_AMOUNT' ? `R$${promo.value} OFF` : 'Frete Grátis'
          const color = promo.type === 'PERCENTAGE' ? 'from-emerald-500 to-teal-600' :
                        promo.type === 'FIXED_AMOUNT' ? 'from-amber-500 to-orange-600' :
                        'from-primary to-emerald-600'
          setAppliedPromos(prev => [...prev, {
            code: promo.code,
            discountLabel,
            discountValue: `${promo.value}`,
            color,
            type: promo.type === 'PERCENTAGE' ? 'percentage' : promo.type === 'FIXED_AMOUNT' ? 'fixed' : 'free_delivery',
          }])
          setSuccessAnimation(true)
          setTimeout(() => setSuccessAnimation(false), 1500)
          toast.success(`Cupom ${code} aplicado com sucesso! 🎉`)
          setPromoInput('')
        } else {
          const errorMsg = data.error || 'Código inválido ou expirado'
          setError(errorMsg)
          setShakeError(true)
          setTimeout(() => setShakeError(false), 600)
          toast.error(errorMsg)
        }
        setApplyingCode(null)
      })
      .catch(() => {
        setError('Erro de conexão. Tente novamente.')
        setShakeError(true)
        setTimeout(() => setShakeError(false), 600)
        toast.error('Erro de conexão. Tente novamente.')
        setApplyingCode(null)
      })
  }

  const handleRemovePromo = (code: string) => {
    setAppliedPromos(prev => prev.filter(p => p.code !== code))
    toast.info('Cupom removido')
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Código ${code} copiado!`)
  }

  return (
    <div className="r62-card-lift space-y-3">
      {/* Promo code input — Glassmorphism card */}
      <Card className="border-primary/20 overflow-hidden promo-glass relative">
        {/* Floating discount tag particles */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`promo-tag-${i}`}
            className="promo-tag-float absolute pointer-events-none"
            style={{
              left: `${10 + i * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${5 + i}s`,
            }}
          >
            <Tag className="h-3 w-3 text-primary/8 dark:text-primary/12 rotate-12" />
          </div>
        ))}

        <CardContent className="p-4 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
            >
              <Tag className="h-4 w-4 text-white" />
            </motion.div>
            <div>
              <span className="text-sm font-semibold">Código Promocional</span>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Aplique seu cupom de desconto</p>
            </div>
          </div>

          <motion.div
            className={`flex gap-2 ${shakeError ? 'promo-shake' : ''}`}
          >
            <div className="flex-1 relative">
              <Input
                placeholder="Digite seu cupom..."
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
                className="flex-1 h-10 uppercase pr-8 promo-input-glow"
                disabled={applyingCode !== null}
              />
              {promoInput && (
                <button
                  onClick={() => { setPromoInput(''); setError(null) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            {/* Apply button with shimmer — wrapped in motion.div since Button doesn't support whileHover */}
            <motion.div whileTap={{ scale: 0.95 }} className="shrink-0">
              <Button
                onClick={handleApplyCode}
                disabled={!promoInput.trim() || applyingCode !== null}
                className="h-10 px-5 bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary/90 hover:to-emerald-600/90 gap-1.5 promo-btn-shimmer relative overflow-hidden"
              >
                {applyingCode ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                  />
                ) : (
                  <>
                    <Tag className="h-4 w-4" />
                    Aplicar
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-500 mt-2 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success animation with confetti */}
          <AnimatePresence>
            {successAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-2 relative"
              >
                {/* Confetti particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ConfettiParticle key={`confetti-${i}`} index={i} />
                  ))}
                </div>

                <div className="relative bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg px-3 py-2 flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 25 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                  <span className="text-xs font-semibold">Cupom aplicado com sucesso!</span>
                  <motion.div
                    className="ml-auto"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' as const, delay: 0.2 }}
                  >
                    <PartyPopper className="h-4 w-4" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Applied promos */}
      <AnimatePresence>
        {hasAppliedPromos && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 px-1">
              <Check className="h-3 w-3 text-emerald-500" />
              Cupons aplicados ({appliedPromos.length})
            </p>
            {appliedPromos.map((promo) => (
              <motion.div
                key={promo.code}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                layout
              >
                <Card className={`bg-gradient-to-r ${promo.color} border-0 text-white overflow-hidden`}>
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-24 flex flex-col items-center justify-center p-3 border-r border-dashed border-white/25">
                        <span className="text-xl font-extrabold">{promo.discountLabel}</span>
                        <span className="text-[9px] text-white/70 mt-0.5">Desconto</span>
                      </div>
                      <div className="flex-1 p-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{promo.code}</p>
                          <p className="text-[10px] text-white/80">
                            {promo.type === 'percentage' && `Desconto de ${promo.discountValue} no pedido`}
                            {promo.type === 'fixed' && `Desconto de ${promo.discountValue} no pedido`}
                            {promo.type === 'free_delivery' && 'Frete grátis neste pedido'}
                          </p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleRemovePromo(promo.code)}
                          className="h-7 w-7 min-h-[44px] min-w-[44px] rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors active:scale-95"
                          aria-label={`Remover cupom ${promo.code}`}
                        >
                          <X className="h-3.5 w-3.5 text-white" />
                        </motion.button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available promos section — only from API */}
      {apiPromotions.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center justify-between px-1 mb-2.5">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Cupons disponíveis
            </p>
          </div>

          {isLoadingPromos ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2.5 w-full" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {availablePromos.map((promo) => (
                <motion.div
                  key={promo.code}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: 'spring' as const, stiffness: 200, damping: 20 }}
                  whileHover={{
                    scale: 1.01,
                    y: -2,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transition: { duration: 0.2 },
                  }}
                >
                  <Card className="border-border/50 transition-shadow overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setPromoInput(promo.code)
                      setError(null)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${promo.color} flex items-center justify-center shrink-0 shadow-sm`}>
                          {promo.type === 'percentage' ? (
                            <Percent className="h-5 w-5 text-white" />
                          ) : promo.type === 'fixed' ? (
                            <Tag className="h-5 w-5 text-white" />
                          ) : (
                            <Truck className="h-5 w-5 text-white" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-xs">{promo.code}</p>
                            <Badge className="text-[8px] px-1 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 font-bold">
                              {promo.discountLabel}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{promo.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {promo.validUntil && (
                              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                Até {promo.validUntil}
                              </span>
                            )}
                            {promo.minOrder && (
                              <span className="text-[9px] text-muted-foreground">
                                Mín. {promo.minOrder}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Copy button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-[10px] shrink-0 gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyCode(promo.code)
                          }}
                        >
                          <Copy className="h-3 w-3" />
                          Copiar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No promotions state */}
      {!isLoadingPromos && apiPromotions.length === 0 && !hasAppliedPromos && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <Sparkles className="h-10 w-10 mx-auto mb-2 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">Nenhum cupom disponível no momento</p>
          <p className="text-xs text-muted-foreground mt-1">Mas você ainda pode digitar um código acima!</p>
        </motion.div>
      )}
    </div>
  )
}
