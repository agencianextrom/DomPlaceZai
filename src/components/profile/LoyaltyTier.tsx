'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Award, Gift, Truck, Percent, Star, Crown, Zap, Info, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { AnimatePresence } from 'framer-motion'

const tiers = [
  { id: 'bronze', name: 'Bronze', minXP: 0, maxXP: 500, color: 'from-amber-700 to-amber-600', textColor: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/10', borderColor: 'border-amber-200 dark:border-amber-800/30', icon: Shield },
  { id: 'prata', name: 'Prata', minXP: 500, maxXP: 1500, color: 'from-gray-400 to-gray-300', textColor: 'text-gray-500 dark:text-gray-300', bgColor: 'bg-gray-50 dark:bg-gray-800/10', borderColor: 'border-gray-200 dark:border-gray-700/30', icon: Award },
  { id: 'ouro', name: 'Ouro', minXP: 1500, maxXP: 3000, color: 'from-yellow-500 to-amber-500', textColor: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/10', borderColor: 'border-yellow-200 dark:border-yellow-800/30', icon: Crown },
  { id: 'platina', name: 'Platina', minXP: 3000, maxXP: 6000, color: 'from-teal-500 to-cyan-400', textColor: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-50 dark:bg-teal-900/10', borderColor: 'border-teal-200 dark:border-teal-800/30', icon: Zap },
  { id: 'diamante', name: 'Diamante', minXP: 6000, maxXP: 10000, color: 'from-primary to-emerald-400', textColor: 'text-primary', bgColor: 'bg-primary/5', borderColor: 'border-primary/20', icon: Star },
]

const tierBenefits = [
  { icon: Truck, label: 'Frete grátis', fromTier: 2, desc: 'A partir de R$30' },
  { icon: Percent, label: 'Desconto exclusivo', fromTier: 1, desc: 'Até 15% nas lojas parceiras' },
  { icon: Gift, label: 'Presente de aniversário', fromTier: 3, desc: 'Surpresa especial no seu dia' },
  { icon: Star, label: 'Pontos em dobro', fromTier: 4, desc: 'Em todas as compras' },
  { icon: Crown, label: 'Atendimento VIP', fromTier: 3, desc: 'Suporte prioritário 24h' },
  { icon: Shield, label: 'Entrega garantida', fromTier: 2, desc: 'Reembolso automático se atrasar' },
]

const tierHistory = [
  { tier: 'Bronze', date: 'Jan 2025', xp: 0 },
  { tier: 'Prata', date: 'Fev 2025', xp: 520 },
  { tier: 'Ouro', date: 'Mar 2025', xp: 1550 },
]

export function LoyaltyTier() {
  const currentTierIndex = 2 // Ouro
  const currentXP = 2500
  const currentTier = tiers[currentTierIndex]
  const nextTier = tiers[currentTierIndex + 1]
  const progressInTier = ((currentXP - currentTier.minXP) / (nextTier.maxXP - currentTier.minXP)) * 100
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const CurrentIcon = currentTier.icon
  const NextIcon = nextTier?.icon

  // Sparkle particles for tier change effect
  const sparkles = [...Array(8)].map((_, i) => ({
    delay: i * 0.08,
    angle: (i * 45) * (Math.PI / 180),
    distance: 18 + Math.random() * 12,
  }))

  return (
    <div className="space-y-4">
      {/* Current Tier Card — Enhanced with glow */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentTier.color} p-[2px] loyalty-tier-glow-card r27-tier-glow`}
      >
        <div className="rounded-2xl bg-card p-4">
          {/* Decorative glowing orb — enhanced */}
          <motion.div
            className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${currentTier.color} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4`}
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
          />
          {/* Secondary glow orb */}
          <motion.div
            className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br ${currentTier.color} opacity-[0.06] rounded-full blur-2xl translate-y-1/2 -translate-x-1/4`}
            animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.5 }}
          />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              {/* Rotating tier badge — enhanced */}
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }}
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${currentTier.color} flex items-center justify-center shadow-lg loyalty-tier-badge-rotate r27-tier-shimmer`}
              >
                <CurrentIcon className="h-7 w-7 text-white" />
                {/* Sparkle ring around badge */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-white/20"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
                />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold loyalty-tier-shimmer-name r27-unlock-text">{currentTier.name}</h3>
                  <Badge className="text-[9px] bg-white/20 text-white border-0 backdrop-blur-sm loyalty-tier-badge-pulse">Nível {currentTierIndex + 1}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{currentXP.toLocaleString('pt-BR')} XP acumulados</p>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-right"
            >
              <p className="text-2xl font-bold shimmer-text">{currentTierIndex + 1}</p>
              <p className="text-[10px] text-muted-foreground">de 5 níveis</p>
            </motion.div>
          </div>
          {/* Sparkle particles on current tier */}
          <div className="absolute top-2 right-2 pointer-events-none" aria-hidden="true">
            {sparkles.map((s, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${currentTier.color.includes('yellow') ? 'oklch(0.85 0.14 70)' : 'rgba(255,255,255,0.5)'}, transparent)`,
                }}
                animate={{
                  x: [0, Math.cos(s.angle) * s.distance, 0],
                  y: [0, Math.sin(s.angle) * s.distance, 0],
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: s.delay + 1, ease: 'easeOut' as const }}
              />
            ))}
          </div>

          {/* Progress to next tier — animated fill with glow */}
          {nextTier && (
            <div className="mt-4 relative z-10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={currentTier.textColor}>{currentTier.name}</span>
                <span className="text-muted-foreground">{nextTier.maxXP - currentXP} XP para <span className={nextTier.textColor}>{nextTier.name}</span></span>
                <span className={nextTier.textColor}>{nextTier.name}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden loyalty-tier-progress-track r27-bar-particles">
                {/* Animated glow behind progress bar */}
                <motion.div
                  className="absolute inset-0 rounded-full loyalty-tier-progress-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressInTier}%` }}
                  transition={{ duration: 1.4, ease: 'easeOut' as const, delay: 0.3 }}
                  style={{
                    background: `linear-gradient(90deg, ${currentTier.color.includes('yellow') ? 'oklch(0.85 0.14 70 / 0.15)' : 'oklch(0.65 0.12 155 / 0.15)'}, transparent)`,
                  }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressInTier}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className={`h-full rounded-full bg-gradient-to-r ${currentTier.color} relative`}
                />
                {/* Shimmer sweep on progress */}
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  >
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </motion.div>
                </motion.div>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-[10px] text-muted-foreground mt-1 text-center"
              >{Math.round(progressInTier)}% do próximo nível</motion.p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tier Journey — Enhanced with hover glow */}
      <Card className="border-border/50 overflow-hidden loyalty-tier-journey-card">
        <CardContent className="p-0">
          <div className="p-3 flex items-center justify-between">
            <h4 className="text-xs font-semibold">Jornada de Fidelidade</h4>
            <button onClick={() => setShowHowItWorks(!showHowItWorks)} className="flex items-center gap-0.5 text-[10px] text-primary hover:underline">
              <Info className="h-3 w-3" />
              Como funciona
            </button>
          </div>

          <AnimatePresence>
            {showHowItWorks && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-1.5 bg-muted/30">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    • Ganhe <strong>1 XP</strong> para cada <strong>R$ 1,00</strong> gasto em compras
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    • Avaliações de produtos dão <strong>10 XP</strong> cada
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    • Indique amigos e ganhe <strong>50 XP</strong> por indicação aceita
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    • Os pontos não expiram enquanto houver atividade nos últimos 90 dias
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    • Cada nível desbloqueia benefícios exclusivos automaticamente
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex">
            {tiers.map((tier, i) => {
              const TierIcon = tier.icon
              const isReached = i <= currentTierIndex
              const isCurrent = i === currentTierIndex
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex-1 flex flex-col items-center py-2.5 relative ${isCurrent ? 'bg-primary/5' : ''} ${i < tiers.length - 1 ? 'border-r border-border/30' : ''}`}
                >
                  <motion.div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${isReached ? `bg-gradient-to-br ${tier.color} shadow-md loyalty-tier-icon-glow` : 'bg-muted'} ${isCurrent ? 'r27-tier-glow' : ''}${!isReached ? ' r27-lock-overlay' : ''}`}
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 2, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' as const }}
                    whileHover={{ scale: 1.15, rotate: 8 }}
                  >
                    <TierIcon className={`h-4 w-4 ${isReached ? 'text-white' : 'text-muted-foreground'}`} />
                  </motion.div>
                  <p className={`text-[9px] font-medium mt-1 ${isReached ? tier.textColor : 'text-muted-foreground'}`}>{tier.name}{isReached && <span className="ml-0.5 r27-unlock-text text-[8px]">Desbloqueado!</span>}</p>
                  {isCurrent && (
                    <motion.div
                      layoutId="tier-indicator"
                      className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-primary"
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5 text-primary" />
            Benefícios por nível
          </h4>
          <div className="space-y-2">
            {tierBenefits.map((benefit, i) => {
              const BenefitIcon = benefit.icon
              const isUnlocked = currentTierIndex >= benefit.fromTier
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${isUnlocked ? 'bg-primary/5' : 'bg-muted/30 opacity-60'}`}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                    <BenefitIcon className={`h-4 w-4 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold">{benefit.label}</p>
                      {isUnlocked && <Badge className="text-[8px] bg-primary/10 text-primary border-0">Ativo</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{benefit.desc}</p>
                  </div>
                  {!isUnlocked && (
                    <Badge variant="outline" className="text-[8px] shrink-0">
                      {tiers[benefit.fromTier].name}+
                    </Badge>
                  )}
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tier History */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            Histórico de níveis
          </h4>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary to-amber-400 rounded-full" />
            {tierHistory.map((entry, i) => {
              const tierData = tiers.find(t => t.name === entry.tier)!
              const TierIcon = tierData.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="relative flex items-center gap-3"
                >
                  <div className={`absolute -left-6 h-6 w-6 rounded-full bg-gradient-to-br ${tierData.color} flex items-center justify-center shadow-sm`}>
                    <TierIcon className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">{entry.tier}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.date} · {entry.xp} XP</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
