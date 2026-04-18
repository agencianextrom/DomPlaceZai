'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Lock, Copy, Check, Clock, Sparkles, Tag, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface PromoCode {
  id: string
  code: string
  description: string
  status: 'active' | 'expired' | 'locked'
  pointsNeeded: number | null
  validUntil: string | null
  accent: string
}

const currentPoints = 1250

const promoCodes: PromoCode[] = [
  {
    id: 'pc1',
    code: 'DOMPLACE10',
    description: '10% de desconto no primeiro pedido',
    status: 'locked',
    pointsNeeded: 200,
    validUntil: '31/12/2025',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'pc2',
    code: 'FRETEGRATIS',
    description: 'Frete grátis em qualquer pedido',
    status: 'locked',
    pointsNeeded: 500,
    validUntil: '30/06/2025',
    accent: 'from-amber-500 to-orange-600',
  },
  {
    id: 'pc3',
    code: 'ACAI15',
    description: '15% de desconto em lojas de Açaí',
    status: 'active',
    pointsNeeded: null,
    validUntil: '31/07/2025',
    accent: 'from-primary to-emerald-600',
  },
  {
    id: 'pc4',
    code: 'BEMVINDO',
    description: '20% de desconto na primeira compra',
    status: 'expired',
    pointsNeeded: null,
    validUntil: '01/04/2025',
    accent: 'from-gray-400 to-gray-500',
  },
  {
    id: 'pc5',
    code: 'VERAO2025',
    description: 'R$15 de desconto em pedidos acima de R$80',
    status: 'active',
    pointsNeeded: null,
    validUntil: '28/02/2025',
    accent: 'from-rose-500 to-pink-600',
  },
]

function StatusBadge({ status }: { status: PromoCode['status'] }) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] font-medium gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ativo
        </Badge>
      )
    case 'expired':
      return (
        <Badge variant="secondary" className="text-[10px] font-medium gap-1 text-muted-foreground">
          <AlertTriangle className="h-2.5 w-2.5" />
          Expirado
        </Badge>
      )
    case 'locked':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] font-medium gap-1">
          <Lock className="h-2.5 w-2.5" />
          Bloqueado
        </Badge>
      )
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
}

export function PromoCodeRedemption() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success(`Cupom ${code} copiado!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Gift className="h-4 w-4 text-white" />
        </div>
        <h3 className="font-semibold text-base">Central de Cupons</h3>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary ml-auto">
          <Sparkles className="h-3 w-3 mr-0.5" />
          {currentPoints.toLocaleString('pt-BR')} pts
        </Badge>
      </div>

      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {promoCodes.map((promo) => {
          const isLocked = promo.status === 'locked'
          const isExpired = promo.status === 'expired'
          const isCopied = copiedId === promo.id
          const progressPct = promo.pointsNeeded
            ? Math.min((currentPoints / promo.pointsNeeded) * 100, 100)
            : 0

          return (
            <motion.div key={promo.id} variants={itemVariants}>
              <Card
                className={`py-0 overflow-hidden transition-shadow hover:shadow-md ${
                  isExpired ? 'opacity-60' : isLocked ? 'border-amber-200/50 dark:border-amber-800/30' : 'border-primary/20'
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Left accent strip */}
                    <div
                      className={`w-1.5 shrink-0 bg-gradient-to-b ${promo.accent} ${
                        isExpired ? 'opacity-40' : ''
                      }`}
                    />

                    <div className="flex-1 p-4 flex items-start gap-3">
                      {/* Icon area */}
                      <div
                        className={`h-11 w-11 rounded-xl bg-gradient-to-br ${promo.accent} flex items-center justify-center shrink-0 shadow-sm ${
                          isExpired ? 'opacity-50 grayscale' : isLocked ? 'opacity-60' : ''
                        }`}
                      >
                        {isLocked ? (
                          <Lock className="h-5 w-5 text-white" />
                        ) : isExpired ? (
                          <AlertTriangle className="h-5 w-5 text-white" />
                        ) : (
                          <Tag className="h-5 w-5 text-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p
                              className={`font-mono font-bold text-sm tracking-wide ${
                                isExpired ? 'text-muted-foreground line-through' : ''
                              }`}
                            >
                              {promo.code}
                            </p>
                            <StatusBadge status={promo.status} />
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">{promo.description}</p>

                        {promo.validUntil && !isLocked && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground/60" />
                            <span className="text-[10px] text-muted-foreground">
                              Válido até {promo.validUntil}
                            </span>
                          </div>
                        )}

                        {/* Locked: points progress */}
                        {isLocked && promo.pointsNeeded && (
                          <div className="mt-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">
                                Necessário {promo.pointsNeeded} pontos
                              </span>
                              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                {Math.min(progressPct, 100).toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={Math.min(progressPct, 100)} className="h-1.5" />
                            <p className="text-[10px] text-muted-foreground">
                              Faltam{' '}
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                {Math.max(promo.pointsNeeded - currentPoints, 0).toLocaleString('pt-BR')}
                              </span>{' '}
                              pontos para desbloquear
                            </p>
                          </div>
                        )}

                        {/* Copy button for active codes */}
                        {!isLocked && !isExpired && (
                          <div className="mt-2.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                              onClick={() => handleCopy(promo.code, promo.id)}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  Copiar
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
