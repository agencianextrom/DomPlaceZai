'use client'

import { useState, useEffect } from 'react'
import { GitCompareArrows, Check, Star, Clock, BarChart3, ArrowRight, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'

/* ───────────────────────────────────────────────────────────────
   Animated counter hook
   ─────────────────────────────────────────────────────────────── */

function useAnimatedCounter(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * target)
      setCount(start)
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    const frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return count
}

/* ───────────────────────────────────────────────────────────────
   Shimmer sweep button
   ─────────────────────────────────────────────────────────────── */

function ShimmerButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.div whileTap={{ scale: 0.96 }} className="w-full">
      <Button
        className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-purple-500/20 relative overflow-hidden border-0 gap-2"
        onClick={onClick}
      >
        {/* Shimmer sweep overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, repeatDelay: 1 }}
        >
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-12deg]" />
        </motion.div>
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </Button>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   VS Badge with pulsing glow
   ─────────────────────────────────────────────────────────────── */

function VSBadge() {
  return (
    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
      {/* Pulsing glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      <motion.div
        className="absolute inset-[-4px] rounded-full bg-gradient-to-br from-purple-400/15 to-indigo-400/15"
        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 }}
      />
      {/* Badge */}
      <motion.div
        className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <span className="text-xs font-extrabold text-white tracking-wider">VS</span>
      </motion.div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Product emoji grid
   ─────────────────────────────────────────────────────────────── */

const comparisonProducts = [
  { emoji: '📱', name: 'Fone A', price: 'R$ 199' },
  { emoji: '🎧', name: 'Fone B', price: 'R$ 249' },
  { emoji: '🔈', name: 'Fone C', price: 'R$ 179' },
]

function ProductEmojiGrid() {
  return (
    <div className="flex items-center justify-center gap-0 my-4">
      {comparisonProducts.map((product, i) => (
        <div key={product.name} className="flex items-center gap-0">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.3 + i * 0.15,
              type: 'spring' as const,
              stiffness: 300,
              damping: 20,
            }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-md">
              <span className="text-3xl sm:text-4xl">{product.emoji}</span>
            </div>
            <span className="text-[10px] text-white/80 font-medium mt-1.5">{product.name}</span>
            <span className="text-[10px] text-white/60">{product.price}</span>
          </motion.div>
          {i < comparisonProducts.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.15, type: 'spring' as const, stiffness: 400, damping: 20 }}
            >
              <VSBadge />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Quick comparison tips
   ─────────────────────────────────────────────────────────────── */

const tips = [
  'Compare preços e avaliações lado a lado',
  'Veja diferenças de especificações detalhadas',
  'Encontre o melhor custo-benefício',
]

function ComparisonTips() {
  return (
    <div className="space-y-2">
      {tips.map((tip, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 + i * 0.12, duration: 0.4 }}
          className="flex items-start gap-2"
        >
          <div className="mt-0.5 h-4 w-4 rounded-full bg-emerald-400/90 dark:bg-emerald-500/80 flex items-center justify-center shrink-0">
            <Check className="h-2.5 w-2.5 text-white" />
          </div>
          <span className="text-xs text-white/80 leading-relaxed">{tip}</span>
        </motion.div>
      ))}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Stats row
   ─────────────────────────────────────────────────────────────── */

const stats = [
  { icon: Star, value: '4.8★', label: 'satisfação' },
  { icon: Clock, value: '2min', label: 'tempo médio de comparação' },
  { icon: BarChart3, value: '50K+', label: 'comparações realizadas' },
]

function StatsRow() {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-1">
            <stat.icon className="h-3.5 w-3.5 text-blue-300" />
            <span className="text-sm font-bold text-white">{stat.value}</span>
          </div>
          <span className="text-[9px] text-white/50 mt-0.5">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Gradient orb component
   ─────────────────────────────────────────────────────────────── */

function GradientOrb({ color, size, x, y, delay }: { color: string; size: number; x: string; y: string; delay: number }) {
  return (
    <motion.div
      className={`absolute rounded-full ${color} pointer-events-none blur-xl`}
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        scale: [1, 1.2, 0.9, 1.1, 1],
        opacity: [0.3, 0.5, 0.4, 0.6, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay,
      }}
    />
  )
}

/* ───────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ─────────────────────────────────────────────────────────────── */

export function CompareProductsCTA() {
  const { navigate } = useAppStore()
  const counterValue = useAnimatedCounter(4, 1000)

  const handleStartComparing = () => {
    navigate('home')
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6, type: 'spring' as const, stiffness: 200, damping: 25 }}
      className="relative overflow-hidden"
    >
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 min-h-[380px] sm:min-h-[420px] flex flex-col items-center justify-center px-4 py-8 sm:px-8">
        {/* Floating gradient orbs */}
        <GradientOrb color="bg-blue-400" size={120} x="5%" y="10%" delay={0} />
        <GradientOrb color="bg-purple-500" size={100} x="80%" y="5%" delay={1.5} />
        <GradientOrb color="bg-pink-400" size={80} x="75%" y="70%" delay={3} />
        <GradientOrb color="bg-cyan-400" size={90} x="10%" y="75%" delay={4.5} />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 shadow-lg"
          >
            <GitCompareArrows className="h-7 w-7 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl sm:text-2xl font-bold text-white mb-1"
          >
            Compare Produtos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-sm text-white/70 mb-2"
          >
            Encontre o produto perfeito comparando lado a lado
          </motion.p>

          {/* Highlight badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 20 }}
            className="mb-1"
          >
            <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-xs px-3 py-1 gap-1.5">
              <Layers className="h-3 w-3" />
              Compare até <span className="font-bold text-yellow-300 mx-0.5 text-sm tabular-nums">{counterValue}</span> produtos
            </Badge>
          </motion.div>

          {/* Product emoji comparison grid */}
          <ProductEmojiGrid />

          {/* Comparison tips */}
          <ComparisonTips />

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.4 }}
            className="w-full mt-5"
          >
            <ShimmerButton onClick={handleStartComparing}>
              <GitCompareArrows className="h-4 w-4" />
              Começar a Comparar
              <ArrowRight className="h-4 w-4" />
            </ShimmerButton>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-6"
          >
            <StatsRow />
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
