'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  /** Enable animated gradient border effect */
  animatedBorder?: boolean
  /** Animation intensity for border (0-1, default: 0.5) */
  borderIntensity?: number
  /** Blur amount in px (default: 16) */
  blur?: number
  /** Opacity of card background (default: 0.6) */
  bgOpacity?: number
  /** Enable hover lift effect */
  hoverLift?: boolean
  /** Enable hover glow */
  hoverGlow?: boolean
  /** Gradient colors for animated border (CSS gradient string) */
  gradientColors?: string
}

/**
 * GlassCard — glassmorphism card with optional animated gradient border.
 * Built for the DomPlace marketplace visual design system.
 */
export function GlassCard({
  children,
  animatedBorder = false,
  borderIntensity = 0.5,
  blur = 16,
  bgOpacity = 0.6,
  hoverLift = false,
  hoverGlow = false,
  gradientColors,
  className,
}: GlassCardProps) {
  const bgGradient = gradientColors || 'linear-gradient(135deg, oklch(0.45 0.1 155), oklch(0.78 0.16 70), oklch(0.55 0.08 140), oklch(0.45 0.1 155))'

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl',
        hoverLift && 'card-premium-hover',
        hoverGlow && 'hover-glow',
        className,
      )}
      initial={hoverLift ? { opacity: 0, y: 12 } : undefined}
      animate={hoverLift ? { opacity: 1, y: 0 } : undefined}
      style={{
        backdropFilter: `blur(${blur}px) saturate(180%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
      }}
    >
      {/* Glass background layer */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'oklch(1 0 0 / 0.6)',
          opacity: bgOpacity,
        }}
        aria-hidden="true"
      />

      {/* Animated gradient border */}
      {animatedBorder && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ opacity: borderIntensity }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{
              background: bgGradient,
              backgroundSize: '300% 300%',
              padding: '1.5px',
              WebkitMask:
                'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              mask:
                'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}

      {/* Subtle border */}
      <div
        className="absolute inset-0 rounded-xl border pointer-events-none"
        style={{
          borderColor: 'oklch(1 0 0 / 0.15)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
