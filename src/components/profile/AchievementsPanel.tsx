'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/badge'
import { Lock, Unlock, Flame, ShoppingCart, Heart, Star, Store, Zap, Crown, Gift, TrendingUp } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  iconColor: string
  bgColor: string
  requirement: () => boolean
  category: 'shopping' | 'social' | 'exploration'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

const tierStyles = {
  bronze: 'from-amber-600 to-yellow-700 text-white',
  silver: 'from-slate-300 to-slate-400 text-white',
  gold: 'from-yellow-400 to-amber-500 text-white',
  platinum: 'from-purple-400 to-indigo-500 text-white',
}

const tierLabels = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  platinum: 'Platina',
}

export function AchievementsPanel() {
  const { cartItems, favoriteProductIds, favoriteStoreIds, recentlyViewed, compareProductIds } = useAppStore()

  // Floating trophy/star particles config
  const floatingAchieveParticles = [
    { emoji: '🏆', delay: 0, x: '5%', y: '10%' },
    { emoji: '⭐', delay: 1.5, x: '80%', y: '15%' },
    { emoji: '🎖️', delay: 3, x: '15%', y: '75%' },
    { emoji: '🌟', delay: 4.5, x: '70%', y: '80%' },
  ]

  const achievements = useMemo<Achievement[]>(() => [
    // Shopping achievements
    {
      id: 'first-purchase',
      title: 'Primeira Compra',
      description: 'Adicione o primeiro item ao carrinho',
      icon: ShoppingCart,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      requirement: () => cartItems.length >= 1,
      category: 'shopping',
      tier: 'bronze',
    },
    {
      id: 'cart-explorer',
      title: 'Explorador de Carrinho',
      description: 'Tenha 3 itens diferentes no carrinho',
      icon: ShoppingCart,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      requirement: () => cartItems.length >= 3,
      category: 'shopping',
      tier: 'silver',
    },
    {
      id: 'cart-master',
      title: 'Mestre do Carrinho',
      description: 'Tenha 5 itens no carrinho',
      icon: ShoppingCart,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      requirement: () => cartItems.length >= 5,
      category: 'shopping',
      tier: 'gold',
    },
    // Social achievements
    {
      id: 'first-favorite',
      title: 'Coracao de Ouro',
      description: 'Favorite seu primeiro produto',
      icon: Heart,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      requirement: () => favoriteProductIds.size >= 1,
      category: 'social',
      tier: 'bronze',
    },
    {
      id: 'collector',
      title: 'Colecionador',
      description: 'Favorite 10 produtos',
      icon: Heart,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      requirement: () => favoriteProductIds.size >= 10,
      category: 'social',
      tier: 'silver',
    },
    {
      id: 'store-fan',
      title: 'Fa de Lojas',
      description: 'Favorite 3 lojas',
      icon: Store,
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      requirement: () => favoriteStoreIds.size >= 3,
      category: 'social',
      tier: 'silver',
    },
    // Exploration achievements
    {
      id: 'explorer',
      title: 'Explorador',
      description: 'Visualize 5 produtos diferentes',
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      requirement: () => recentlyViewed.length >= 5,
      category: 'exploration',
      tier: 'bronze',
    },
    {
      id: 'curious',
      title: 'Curioso',
      description: 'Visualize 10 produtos',
      icon: TrendingUp,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      requirement: () => recentlyViewed.length >= 10,
      category: 'exploration',
      tier: 'silver',
    },
    {
      id: 'analyst',
      title: 'Analista',
      description: 'Compare 2 produtos',
      icon: Zap,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      requirement: () => compareProductIds.length >= 2,
      category: 'exploration',
      tier: 'gold',
    },
    // Special achievements
    {
      id: 'loyalist',
      title: 'Cliente Fiel',
      description: 'Favorite 20 produtos e 5 lojas',
      icon: Crown,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      requirement: () => favoriteProductIds.size >= 20 && favoriteStoreIds.size >= 5,
      category: 'social',
      tier: 'platinum',
    },
    {
      id: 'gift-hunter',
      title: 'Caçador de Ofertas',
      description: 'Tenha 5 itens no carrinho de uma vez',
      icon: Gift,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      requirement: () => cartItems.reduce((sum, item) => sum + item.quantity, 0) >= 5,
      category: 'shopping',
      tier: 'platinum',
    },
    {
      id: 'all-seeing',
      title: 'Onisciente',
      description: 'Visualize todos os produtos disponíveis',
      icon: Star,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      requirement: () => recentlyViewed.length >= 30,
      category: 'exploration',
      tier: 'platinum',
    },
  ], [cartItems, favoriteProductIds, favoriteStoreIds, recentlyViewed, compareProductIds])

  const unlockedCount = achievements.filter(a => a.requirement()).length
  const totalCount = achievements.length
  const progressPct = Math.round((unlockedCount / totalCount) * 100)

  const categories = [
    { id: 'shopping', label: 'Compras', emoji: '🛒' },
    { id: 'social', label: 'Social', emoji: '💕' },
    { id: 'exploration', label: 'Exploração', emoji: '🔍' },
  ] as const

  return (
    <div className="space-y-4 relative overflow-hidden">
      {/* Floating trophy/star particles */}
      {floatingAchieveParticles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-lg pointer-events-none z-0 select-none"
          style={{ left: p.x, top: p.y }}
          animate={{
            y: [0, -14, 0],
            x: [0, 6, -4, 0],
            opacity: [0, 0.65, 0.65, 0],
            scale: [0.5, 1.1, 1, 0.5],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        >
          {p.emoji}
        </motion.span>
      ))}

      {/* Header with progress */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-purple-200/30 dark:border-purple-800/30 p-4">
        {/* Decorative elements */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-purple-300/20 blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-amber-300/20 blur-xl" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Crown className="h-5 w-5 text-amber-500" />
              </motion.div>
              <h3 className="font-bold text-sm r18-shimmer-header r33-achieve-shimmer">Conquistas</h3>
            </div>
            <span className="text-xs font-bold text-primary r26-counter-pulse">
              {unlockedCount}/{totalCount}
            </span>
          </div>
          {/* Progress bar with shimmer fill */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 relative overflow-hidden r26-particle-trail r33-progress-fill"
            >
              <motion.div
                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {progressPct === 100 ? 'Todas as conquistas desbloqueadas!' : `${100 - progressPct}% para completar`}
          </p>
        </div>
      </div>

      {/* Category groups */}
      {categories.map(cat => {
        const catAchievements = achievements.filter(a => a.category === cat.id)
        const catUnlocked = catAchievements.filter(a => a.requirement()).length
        return (
          <motion.div
            key={cat.id}
            className="space-y-2"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
          >
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm">{cat.emoji}</span>
              <h4 className="text-xs font-semibold text-muted-foreground">
                {cat.label}
              </h4>
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                {catUnlocked}/{catAchievements.length}
              </span>
            </div>
            <motion.div
              className="grid grid-cols-2 gap-2"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {catAchievements.map((achievement, idx) => {
                const isUnlocked = achievement.requirement()
                const Icon = achievement.icon
                return (
                  <motion.div
                    key={achievement.id}
                    variants={{
                      hidden: { opacity: 0, y: 12, scale: 0.95 },
                      show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
                    }}
                    whileHover={{ y: -4, scale: 1.05, boxShadow: '0 16px 40px rgba(168, 85, 247, 0.15), 0 8px 16px rgba(0, 0, 0, 0.06)', borderColor: 'rgba(16,185,129,0.4)' }}
                    className={`relative rounded-xl border p-3 transition-all r26-tilt-3d r33-badge-glow ${
                      isUnlocked
                        ? `${achievement.bgColor} border-primary/20 shadow-sm r33-unlock-pop`
                        : 'bg-card border-border/50 opacity-60 r26-lock-blur'
                    }`}
                  >
                    {/* Achievement tier badge */}
                    <div className={`absolute -top-1.5 -right-1.5 h-4 px-1 rounded-full bg-gradient-to-r ${tierStyles[achievement.tier]} text-[8px] font-bold shadow-sm r26-conic-tier`}>
                      {tierLabels[achievement.tier]}
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <motion.div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isUnlocked
                            ? achievement.bgColor
                            : 'bg-muted'
                        }`}
                        whileHover={{ scale: 1.15 }}
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                      >
                        {isUnlocked ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                          >
                            <Icon className={`h-4 w-4 ${achievement.iconColor}`} />
                          </motion.div>
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/40 r26-icon-shake" />
                        )}
                      </motion.div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold leading-tight line-clamp-1">
                          {achievement.title}
                        </p>
                        <p className="text-[9px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                          {achievement.description}
                        </p>
                      </div>
                    </div>

                    {/* Unlocked checkmark */}
                    {isUnlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 500, damping: 15, delay: 0.1 }}
                        className="absolute bottom-1.5 right-1.5 r26-unlock-glow"
                      >
                        <Unlock className="h-3 w-3 text-emerald-500" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
