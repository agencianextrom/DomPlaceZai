'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface PointsEarnedAnimationProps {
  points: number
  isOpen: boolean
  onClose: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
  rotate: number
  shape: 'circle' | 'square' | 'star'
}

const confettiColors = [
  '#10b981', // emerald-500
  '#34d399', // emerald-400
  '#059669', // emerald-600
  '#f59e0b', // amber-500
  '#fbbf24', // amber-400
  '#16a34a', // green-600
  '#22c55e', // green-500
  '#d97706', // amber-600
]

function AnimatedPointsCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const duration = 1200
    const startTime = performance.now()

    const animate = (now: number) => {
      if (cancelled) return
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
    return () => { cancelled = true }
  }, [target])

  return <span>{count.toLocaleString('pt-BR')}</span>
}

function ConfettiParticle({ particle }: { particle: Particle }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
      }}
      initial={{ scale: 0, opacity: 1, y: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.2, 1],
        opacity: [1, 1, 0],
        y: [0, -30, 120],
        x: [0, (Math.random() - 0.5) * 80],
        rotate: [0, particle.rotate, particle.rotate * 2],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        ease: 'easeOut',
      }}
    >
      {particle.shape === 'circle' ? (
        <div
          className="rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
        />
      ) : particle.shape === 'square' ? (
        <div
          className="rounded-sm"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
        />
      ) : (
        <Star
          className="fill-current"
          style={{
            width: particle.size,
            height: particle.size,
            color: particle.color,
          }}
        />
      )}
    </motion.div>
  )
}

export function PointsEarnedAnimation({ points, isOpen, onClose }: PointsEarnedAnimationProps) {
  const particles = useMemo<Particle[]>(() => {
    const shapes: Particle['shape'][] = ['circle', 'square', 'star']
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 40,
      size: 6 + Math.random() * 10,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      delay: Math.random() * 0.6,
      duration: 1.5 + Math.random() * 1.5,
      rotate: Math.random() * 360,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }))
  }, [points])

  // Auto-close after 3 seconds
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <ConfettiParticle key={p.id} particle={p} />
            ))}
          </div>

          {/* Central card */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-card rounded-2xl shadow-2xl border-0 overflow-hidden w-72 sm:w-80">
              <CardContent className="p-8 text-center">
                {/* Star icon */}
                <motion.div
                  className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                >
                  <Star className="h-8 w-8 text-white fill-white" />
                </motion.div>

                {/* Title */}
                <motion.p
                  className="text-sm font-medium text-muted-foreground mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Pontos ganhos!
                </motion.p>

                {/* Animated points counter */}
                <motion.p
                  className="text-5xl font-bold text-primary mt-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  +<AnimatedPointsCounter key={points} target={points} />
                </motion.p>

                {/* Subtitle */}
                <motion.p
                  className="text-xs text-muted-foreground mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  pontos adicionados ao seu saldo
                </motion.p>

                {/* Glow ring */}
                <motion.div
                  className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 opacity-20 blur-xl -z-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: [0, 0.3, 0.2, 0] }}
                  transition={{ duration: 2.5, delay: 0.2 }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
