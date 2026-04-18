'use client'

import { useState, useEffect } from 'react'
import { Award, Gift, Truck, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'

const rewards = [
  { id: 'r1', pts: 500, label: 'R$5 de desconto', icon: Gift, color: 'from-emerald-500 to-green-600' },
  { id: 'r2', pts: 1000, label: 'Frete grátis', icon: Truck, color: 'from-amber-500 to-orange-600' },
  { id: 'r3', pts: 2000, label: 'R$25 de desconto', icon: Gift, color: 'from-primary to-emerald-600' },
]

const pointsHistory = [
  { id: 'h1', desc: 'Bônus de cadastro', pts: 500, date: '15/04/2025', type: 'bonus' as const },
  { id: 'h2', desc: 'Compra #DP000003', pts: 350, date: 'Ontem', type: 'purchase' as const },
  { id: 'h3', desc: 'Indicação aprovada', pts: 200, date: '10/04/2025', type: 'referral' as const },
  { id: 'h4', desc: 'Compra #DP000001', pts: 200, date: '08/04/2025', type: 'purchase' as const },
  { id: 'h5', desc: 'Avaliação de pedido', pts: 50, date: '05/04/2025', type: 'review' as const },
]

const totalPoints = 1250
const nextRewardPts = 2000
const progressPct = Math.min((totalPoints / nextRewardPts) * 100, 100)

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1500
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [target])

  return <span>{count.toLocaleString('pt-BR')}</span>
}

export function RewardsSection() {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-4">
      {/* Points card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-gradient-to-br from-primary via-emerald-600 to-teal-700 border-0 overflow-hidden relative">
          <CardContent className="p-6 text-white relative">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative text-center">
              <Award className="h-10 w-10 mx-auto mb-2 opacity-80" />
              <p className="text-sm text-white/70">Seus pontos</p>
              <p className="text-5xl font-bold mt-1">
                {showAnimation ? <AnimatedCounter target={totalPoints} /> : '0'}
              </p>
              <p className="text-xs text-white/60 mt-1">pontos acumulados</p>

              {/* Progress to next reward */}
              <div className="mt-5 bg-white/15 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 opacity-70" />
                    <span className="text-xs font-medium opacity-80">Próxima recompensa</span>
                  </div>
                  <span className="text-xs font-bold">{progressPct.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-white/60 mt-1.5">
                  Faltam <span className="font-bold text-white/80">{(nextRewardPts - totalPoints).toLocaleString('pt-BR')}</span> pontos para{' '}
                  <span className="font-bold text-white/80">R$25 de desconto</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Level badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">Nível Bronze</p>
                <p className="text-xs text-muted-foreground">Gaste mais R$250 para subir de nível</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              Ver níveis
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Available rewards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold text-sm mb-3">Recompensas disponíveis</h3>
        <div className="space-y-2">
          {rewards.map((reward) => {
            const canRedeem = totalPoints >= reward.pts
            const RewardIcon = reward.icon
            return (
              <Card
                key={reward.id}
                className={`border-border/50 ${canRedeem ? 'hover:shadow-md cursor-pointer' : 'opacity-70'}`}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${reward.color} flex items-center justify-center shrink-0 shadow-sm`}>
                    <RewardIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{reward.label}</p>
                    <p className="text-xs text-muted-foreground">Trocar {reward.pts} pontos</p>
                  </div>
                  <Button
                    size="sm"
                    variant={canRedeem ? 'default' : 'outline'}
                    className={`h-8 text-xs ${canRedeem ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground'}`}
                    disabled={!canRedeem}
                  >
                    Resgatar
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Points history */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="font-semibold text-sm mb-3">Histórico de pontos</h3>
        <Card>
          <CardContent className="p-0 divide-y divide-border/30">
            {pointsHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.desc}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-primary">+{item.pts}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
