'use client'

import { motion } from 'framer-motion'

interface SectionDividerProps {
  variant?: 'top' | 'bottom'
  color?: string
}

export function SectionDivider({ variant = 'top', color }: SectionDividerProps) {
  const flip = variant === 'bottom' ? 'scaleY(-1)' : ''

  const gradientId = `section-divider-${variant}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative w-full overflow-hidden leading-[0] -mb-px select-none"
      aria-hidden="true"
    >
      {/* Shimmer gradient line overlay */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut' as const }}
        className="section-divider-shimmer absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 z-10"
      />

      {/* Floating decorative dots (CSS animated) */}
      {[
        { left: '8%', top: '20%', delay: 0, size: 6 },
        { left: '22%', top: '60%', delay: 0.8, size: 4 },
        { left: '38%', top: '15%', delay: 1.5, size: 5 },
        { left: '55%', top: '70%', delay: 0.4, size: 3 },
        { left: '72%', top: '25%', delay: 1.2, size: 5 },
        { left: '88%', top: '55%', delay: 0.6, size: 4 },
        { left: '48%', top: '40%', delay: 1.8, size: 3 },
      ].map((dot, i) => (
        <motion.div
          key={`divider-dot-${i}`}
          className="section-divider-dot absolute rounded-full"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            backgroundColor: color || 'oklch(0.45 0.1 155)',
            animationDelay: `${dot.delay}s`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: dot.delay,
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
          }}
        />
      ))}

      {/* Floating animation wrapper */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transform: flip }}
        className="w-full"
      >
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="relative w-full h-[30px] sm:h-[40px] md:h-[50px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`${gradientId}-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color || 'oklch(0.45 0.1 155)'} stopOpacity="0.12" />
              <stop offset="30%" stopColor={color || 'oklch(0.55 0.12 155)'} stopOpacity="0.18" />
              <stop offset="60%" stopColor={color || 'oklch(0.72 0.14 60)'} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color || 'oklch(0.55 0.12 155)'} stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* Main wave path */}
          <motion.path
            fill={`url(#${gradientId}-fill)`}
            initial={{ d: 'M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,80 L0,80 Z' }}
            animate={{
              d: [
                'M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,80 L0,80 Z',
                'M0,40 C240,10 480,70 720,40 C960,10 1200,70 1440,40 L1440,80 L0,80 Z',
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />

          {/* Secondary subtle wave */}
          <motion.path
            fill={color || 'oklch(0.45 0.1 155)'}
            fillOpacity="0.05"
            initial={{ d: 'M0,50 C360,75 720,25 1080,50 C1260,60 1380,55 1440,50 L1440,80 L0,80 Z' }}
            animate={{
              d: [
                'M0,50 C360,75 720,25 1080,50 C1260,60 1380,55 1440,50 L1440,80 L0,80 Z',
                'M0,50 C360,25 720,75 1080,50 C1260,40 1380,55 1440,50 L1440,80 L0,80 Z',
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />

          {/* Decorative dots along the wave */}
          {[
            { cx: 180, cy: 35, delay: 0 },
            { cx: 480, cy: 50, delay: 0.5 },
            { cx: 720, cy: 30, delay: 1 },
            { cx: 960, cy: 55, delay: 1.5 },
            { cx: 1260, cy: 38, delay: 2 },
          ].map((dot) => (
            <motion.circle
              key={dot.cx}
              cx={dot.cx}
              cy={dot.cy}
              r="2"
              fill={color || 'oklch(0.45 0.1 155)'}
              fillOpacity="0.2"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{
                duration: 3,
                delay: dot.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </svg>
      </motion.div>
    </motion.div>
  )
}
