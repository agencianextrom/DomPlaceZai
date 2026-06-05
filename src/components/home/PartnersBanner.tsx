'use client'

import { useState, useMemo, useEffect } from 'react'
import { Handshake, Sparkles, ArrowRight, Award } from 'lucide-react'
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const partners = [
  { name: 'Cooperativa AgroVida', desc: 'Produtos orgânicos direto do produtor', gradient: 'from-green-500 to-emerald-600', icon: '🌿' },
  { name: 'Feira Livre Dom Eliseu', desc: 'Toda sexta-feira no centro da cidade', gradient: 'from-amber-500 to-orange-600', icon: '🏪' },
  { name: 'ART Pará', desc: 'Artesanato local com qualidade', gradient: 'from-rose-500 to-pink-600', icon: '🎨' },
  { name: 'Mercado do Produtor', desc: 'Direto da roça para sua mesa', gradient: 'from-lime-500 to-green-600', icon: '🥬' },
  { name: 'Doces da Dona Maria', desc: 'Doces artesanais feitos com carinho', gradient: 'from-orange-500 to-red-500', icon: '🍰' },
  { name: 'Cerâmica Marajó', desc: 'Tradição indígena em cada peça', gradient: 'from-yellow-600 to-amber-700', icon: '🏺' },
  { name: 'Café do Pará', desc: 'Aromas da Amazônia em cada xícara', gradient: 'from-emerald-600 to-teal-700', icon: '☕' },
  { name: 'Bordados Pará', desc: 'Bordados que contam histórias', gradient: 'from-pink-500 to-rose-600', icon: '🧵' },
]

/** Splits the partners array into two rows */
function usePartnerRows(partnerList: typeof partners) {
  return useMemo(() => {
    const mid = Math.ceil(partnerList.length / 2)
    return {
      row1: partnerList.slice(0, mid),
      row2: partnerList.slice(mid),
    }
  }, [partnerList])
}

/** A single partner logo card with hover glow effect + stagger entrance */
function PartnerLogoCard({ partner, index }: { partner: (typeof partners)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5, type: 'spring' as const, stiffness: 300, damping: 22 }}
      whileHover={{ scale: 1.03, boxShadow: '0 0 28px oklch(0.55 0.12 155 / 0.3), 0 0 56px oklch(0.45 0.1 155 / 0.12), 0 8px 20px oklch(0 0 0 / 0.12)' }}
      whileTap={{ scale: 0.97 }}
      className={`partner-logo-card mx-2 inline-flex flex-shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${partner.gradient} px-5 py-4 sm:px-6 sm:py-5 text-white cursor-pointer relative`}
    >
      {/* Animated background shapes */}
      <motion.div
        className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -left-3 -bottom-3 w-12 h-12 rounded-full bg-white/8"
        animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-30 rounded-xl" />

      <div className="relative z-10 flex flex-col items-center gap-1.5">
        <span className="text-3xl sm:text-4xl block drop-shadow-sm">{partner.icon}</span>
        <h3 className="font-semibold text-sm sm:text-base text-center leading-tight">{partner.name}</h3>
        <p className="text-xs text-white/80 text-center leading-snug">{partner.desc}</p>
      </div>
    </motion.div>
  )
}

/** An infinitely scrolling row of partner logos */
function PartnerMarqueeRow({
  items,
  reverse = false,
}: {
  items: (typeof partners)[number][]
  reverse?: boolean
}) {
  const [paused, setPaused] = useState(false)
  const controls = useAnimationControls()

  // Duplicate the items so the marquee loops seamlessly
  const doubled = [...items, ...items]

  useEffect(() => {
    controls.start({
      x: ['0%', reverse ? '50%' : '-50%'],
      transition: { repeat: Infinity, duration: 20, ease: 'linear' },
    })
  }, [controls, reverse])

  useEffect(() => {
    if (paused) {
      controls.stop()
    } else {
      controls.start({
        x: ['0%', reverse ? '50%' : '-50%'],
        transition: { repeat: Infinity, duration: 20, ease: 'linear' },
      })
    }
  }, [paused, controls, reverse])

  return (
    <div
      className="overflow-hidden relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div className="flex items-stretch" animate={controls}>
        {doubled.map((partner, i) => (
          <PartnerLogoCard key={`${partner.name}-${i}`} partner={partner} index={i % 4} />
        ))}
      </motion.div>
      {/* Gradient fade overlays */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-background z-10 pointer-events-none" />
    </div>
  )
}

/** "Parceiros Oficiais" animated ribbon badge */
function OfficialRibbon() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
      className="ribbon-pulse relative mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 px-5 py-1.5 text-sm font-bold text-white shadow-lg"
    >
      <Award className="h-4 w-4" />
      <span className="relative z-10">Parceiros Oficiais</span>
      <Sparkles className="h-3.5 w-3.5" />

      {/* Sweeping shine effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
          animate={{ translateX: ['100%', '100%'], opacity: [0, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeInOut' as const,
          }}
        />
      </div>
    </motion.div>
  )
}

export function PartnersBanner() {
  const { row1, row2 } = usePartnerRows(partners)

  return (
    <motion.section
      className="w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
    >
      {/* Glassmorphism container with animated conic gradient border + shine sweep */}
      <div className="partners-glass-container partners-conic-border partners-shine-sweep relative overflow-hidden p-4 sm:p-6 r62-card-lift">
        {/* Floating gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-amber-400/15 blur-2xl"
            animate={{ x: [0, 30, -10, 20, 0], y: [0, -20, 15, -10, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' as const }}
          />
          <motion.div
            className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/15 to-rose-400/10 blur-2xl"
            animate={{ x: [0, -25, 15, -20, 0], y: [0, 15, -20, 10, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' as const, delay: 3 }}
          />
          <motion.div
            className="absolute top-1/3 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/15 blur-xl"
            animate={{ x: [0, -15, 10, -5, 0], y: [0, 10, -15, 5, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' as const, delay: 5 }}
          />
        </div>

        {/* Floating particles with different sizes, colors (primary/amber/rose), and durations (8-15s) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => {
            const sizes = [3, 5, 4, 7, 3, 6, 5, 4] as const
            const colors = [
              'oklch(0.45 0.1 155 / 0.25)',   // primary emerald
              'oklch(0.78 0.16 70 / 0.25)',     // amber
              'oklch(0.704 0.191 22 / 0.25)',    // rose
              'oklch(0.55 0.12 155 / 0.25)',     // teal-primary
              'oklch(0.82 0.14 60 / 0.25)',      // warm amber
              'oklch(0.45 0.1 155 / 0.25)',     // primary emerald
              'oklch(0.704 0.191 22 / 0.25)',    // rose
              'oklch(0.78 0.16 70 / 0.25)',     // amber
            ]
            const durations = [8, 10, 12, 15, 9, 11, 13, 10] as const
            const positions = [
              { left: '8%', top: '18%' },
              { left: '20%', top: '72%' },
              { left: '32%', top: '35%' },
              { left: '45%', top: '85%' },
              { left: '57%', top: '22%' },
              { left: '68%', top: '60%' },
              { left: '78%', top: '45%' },
              { left: '90%', top: '75%' },
            ]
            return (
              <motion.div
                key={i}
                className="floating-particle"
                style={{
                  width: sizes[i],
                  height: sizes[i],
                  left: positions[i].left,
                  top: positions[i].top,
                  background: colors[i],
                } as React.CSSProperties}
                animate={{
                  y: [0, -18 - i * 4, -8 + i * 2, 0],
                  x: [0, 6 + i * 2, -4 + i * 1.5, 0],
                  scale: [1, 1.3, 0.85, 1],
                  opacity: [0.15, 0.4, 0.2, 0.15],
                }}
                transition={{
                  duration: durations[i],
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                  delay: i * 1.2,
                }}
              />
            )
          })}
        </div>

        <div className="relative z-10">
          {/* Header with Handshake icon */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <Handshake className="h-5 w-5 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold partners-title-shimmer r62-heading-gradient">Parcerias Locais</h2>
          </div>

          {/* Official ribbon badge */}
          <OfficialRibbon />

          {/* Double-row infinite marquee */}
          <div className="flex flex-col gap-4">
            {/* Row 1 — scrolls left to right */}
            <PartnerMarqueeRow items={row1} reverse={false} />

            {/* Row 2 — scrolls right to left (opposite direction) */}
            <PartnerMarqueeRow items={row2} reverse />
          </div>
        </div>{/* end relative z-10 */}
      </div>{/* end glass container */}

      {/* CTA footer */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-5 flex justify-center"
      >
          <Button
          variant="outline"
          size="sm"
          className="group relative overflow-hidden border-primary/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
        >
          <span className="btn-shine-shimmer absolute inset-0 z-[1] pointer-events-none" aria-hidden="true" />
          <span className="relative z-10 flex items-center gap-1.5">
            Ver ofertas
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      </motion.div>
    </motion.section>
  )
}
