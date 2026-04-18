'use client'

import { useState } from 'react'
import { Tag, Check, X, Sparkles, Clock, Copy, Percent, Truck, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

const availablePromos: PromoCode[] = [
  {
    code: 'ACAI10',
    description: '10% de desconto em pedidos de açaí',
    discountLabel: '10% OFF',
    discountValue: '10%',
    validUntil: '30/06/2025',
    minOrder: 'R$ 30,00',
    type: 'percentage',
    isActive: true,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    code: 'FRETE5',
    description: 'R$5 de desconto no frete',
    discountLabel: 'R$5 OFF',
    discountValue: 'R$ 5,00',
    validUntil: '15/07/2025',
    minOrder: null,
    type: 'fixed',
    isActive: true,
    color: 'from-amber-500 to-orange-600',
  },
  {
    code: 'GRATIS',
    description: 'Frete grátis em compras acima de R$40',
    discountLabel: 'Frete Grátis',
    discountValue: '100%',
    validUntil: '31/07/2025',
    minOrder: 'R$ 40,00',
    type: 'free_delivery',
    isActive: true,
    color: 'from-primary to-emerald-600',
  },
  {
    code: 'DESCONTO20',
    description: '20% de desconto na primeira compra',
    discountLabel: '20% OFF',
    discountValue: '20%',
    validUntil: '31/12/2025',
    minOrder: 'R$ 50,00',
    type: 'percentage',
    isActive: true,
    color: 'from-rose-500 to-pink-600',
  },
]

const validCodes = ['ACAI10', 'FRETE5', 'GRATIS', 'DESCONTO20']

interface AppliedPromo {
  code: string
  discountLabel: string
  discountValue: string
  color: string
  type: string
}

export function PromoCodeWidget() {
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromos, setAppliedPromos] = useState<AppliedPromo[]>([])
  const [applyingCode, setApplyingCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successAnimation, setSuccessAnimation] = useState(false)

  const hasAppliedPromos = appliedPromos.length > 0

  const handleApplyCode = () => {
    const code = promoInput.trim().toUpperCase()
    setError(null)

    if (!code) {
      setError('Digite um código promocional')
      return
    }

    if (appliedPromos.some(p => p.code === code)) {
      setError('Este cupom já foi aplicado')
      return
    }

    setApplyingCode(code)

    // Simulate API call
    setTimeout(() => {
      const promo = availablePromos.find(p => p.code === code)
      if (promo && validCodes.includes(code)) {
        setAppliedPromos(prev => [...prev, {
          code: promo.code,
          discountLabel: promo.discountLabel,
          discountValue: promo.discountValue,
          color: promo.color,
          type: promo.type,
        }])
        setSuccessAnimation(true)
        setTimeout(() => setSuccessAnimation(false), 1500)
        toast.success(`Cupom ${code} aplicado com sucesso! 🎉`)
        setPromoInput('')
      } else {
        setError('Código inválido. Verifique e tente novamente.')
        toast.error('Código inválido')
      }
      setApplyingCode(null)
    }, 800)
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
    <div className="space-y-3">
      {/* Promo code input */}
      <Card className="border-primary/20 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
              <Tag className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold">Código Promocional</span>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Aplique seu cupom de desconto</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Digite seu cupom..."
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value); setError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCode()}
                className="flex-1 h-10 uppercase pr-8"
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
            <Button
              onClick={handleApplyCode}
              disabled={!promoInput.trim() || applyingCode !== null}
              className="h-10 px-5 bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary/90 hover:to-emerald-600/90 gap-1.5"
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
          </div>

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

          {/* Success animation */}
          <AnimatePresence>
            {successAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mt-2 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg px-3 py-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check className="h-4 w-4" />
                </motion.div>
                <span className="text-xs font-semibold">Cupom aplicado com sucesso!</span>
                <motion.div
                  className="ml-auto"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <PartyPopper className="h-4 w-4" />
                </motion.div>
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
                            {promo.type === 'fixed' && `Desconto de ${promo.discountValue} no frete`}
                            {promo.type === 'free_delivery' && 'Frete grátis neste pedido'}
                          </p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => handleRemovePromo(promo.code)}
                          className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
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

      {/* Available promos section */}
      <div className="mt-1">
        <div className="flex items-center justify-between px-1 mb-2.5">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Cupons disponíveis
          </p>
        </div>

        <div className="space-y-2">
          {availablePromos.filter(p => !appliedPromos.some(ap => ap.code === p.code)).map((promo) => (
            <motion.div
              key={promo.code}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/50 hover:shadow-sm transition-shadow overflow-hidden cursor-pointer group"
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
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          Até {promo.validUntil}
                        </span>
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
      </div>
    </div>
  )
}
