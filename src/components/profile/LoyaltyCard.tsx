'use client'

import { useState, useEffect } from 'react'
import { Award, Gift, Truck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LoyaltyCardProps {
  points: number
  nextReward: number
  nextRewardName: string
}

const availableRewards = [
  { id: 'r1', pts: 500, label: 'R$5 de desconto', icon: Gift },
  { id: 'r2', pts: 1000, label: 'Frete grátis', icon: Truck },
  { id: 'r3', pts: 2000, label: 'R$25 de desconto', icon: Gift },
  { id: 'r4', pts: 3000, label: 'Presente surpresa', icon: Sparkles },
]

function AnimatedPointsCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 1500
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [target])

  return <span><motion.span
    initial={{ scale: 0.85 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
  >{count.toLocaleString('pt-BR')}</motion.span></span>
}

export function LoyaltyCard({ points, nextReward, nextRewardName }: LoyaltyCardProps) {
  const progressPct = Math.min((points / nextReward) * 100, 100)
  const pointsNeeded = Math.max(0, nextReward - points)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 16px 40px oklch(0.55 0.12 155 / 0.15), 0 0 30px oklch(0.55 0.12 155 / 0.08)' }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 20, delay: 0.15 }}
      className="relative"
    >
      {/* Floating sparkle particles */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl">
        <motion.div
          animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 right-8 h-2 w-2 rounded-full bg-purple-400/60 blur-[1px]"
        />
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.2, 0.7, 0.2], scale: [0.7, 1.1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          className="absolute top-16 left-6 h-1.5 w-1.5 rounded-full bg-emerald-400/60 blur-[1px]"
        />
        <motion.div
          animate={{ y: [0, -6, 0], opacity: [0.25, 0.75, 0.25], scale: [0.6, 1.15, 0.6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="absolute bottom-12 right-16 h-1.5 w-1.5 rounded-full bg-fuchsia-400/50 blur-[1px]"
        />
        <motion.div
          animate={{ y: [0, 7, 0], opacity: [0.2, 0.65, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute bottom-6 left-12 h-2 w-2 rounded-full bg-amber-400/50 blur-[1px]"
        />
        <motion.div
          animate={{ y: [0, -5, 0], opacity: [0.15, 0.6, 0.15], scale: [0.7, 1.1, 0.7] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-10 left-20 h-1 w-1 rounded-full bg-white/50 blur-[1px]"
        />
      </div>

      {/* Animated gradient border wrapper */}
      <div className="p-[2px] rounded-2xl loyalty-card-border-glow">
        {/* Shimmer overlay on the border */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
        </div>

        {/* Card body with glass morphism */}
        <div className="rounded-[14px] bg-card/80 backdrop-blur-xl relative overflow-hidden">
          {/* Shimmer effect on card surface */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
              className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-12"
            />
          </div>

          {/* Decorative gradient orbs */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="relative p-5">
            {/* Points display */}
            <div className="text-center mb-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.3 }}
                className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 items-center justify-center shadow-lg shadow-purple-500/20 mb-2"
              >
                <Award className="h-7 w-7 text-white" />
              </motion.div>
              <p className="text-sm text-muted-foreground font-medium">Seus pontos</p>
              <p className="text-4xl font-bold mt-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">
                <AnimatedPointsCounter target={points} />
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 shimmer-text">pontos acumulados</p>
            </div>

            {/* Progress to next reward */}
            <div className="bg-muted/50 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Próxima recompensa</span>
                <Badge className="text-[10px] bg-gradient-to-r from-purple-500/10 to-emerald-500/10 text-primary border-0">
                  {progressPct.toFixed(0)}%
                </Badge>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-emerald-500"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                Faltam <span className="font-bold text-primary">{pointsNeeded.toLocaleString('pt-BR')}</span> pontos para{' '}
                <span className="font-bold text-primary">{nextRewardName}</span>
              </p>
            </div>

            {/* Available rewards preview */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recompensas disponíveis</p>
              {availableRewards.filter(r => r.pts <= points).map((reward) => {
                const RewardIcon = reward.icon
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + availableRewards.indexOf(reward) * 0.1 }}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-emerald-500/10 flex items-center justify-center shrink-0">
                      <RewardIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{reward.label}</p>
                      <p className="text-[10px] text-muted-foreground">{reward.pts} pontos</p>
                    </div>
                    <Button size="sm" className="h-6 min-h-[44px] text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 px-2.5">
                      Resgatar
                    </Button>
                  </motion.div>
                )
              })}
              {availableRewards.filter(r => r.pts > points).length > 0 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  +{availableRewards.filter(r => r.pts > points).length} mais recompensas para desbloquear
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
