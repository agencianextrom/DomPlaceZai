'use client'

import { motion } from 'framer-motion'
import { Star, Truck, Store, ShieldCheck, Heart, Users, MessageCircle, Award } from 'lucide-react'

interface Highlight {
  icon: React.ElementType
  title: string
  description: string
  color: string
  bgGradient: string
  iconColor: string
  emoji: string
}

const highlights: Highlight[] = [
  {
    icon: Star, title: 'Avaliações Verificadas',
    description: 'Comenteiros reais de clientes verificados. Transparência total para você comprar com confiança.',
    color: 'from-amber-400 to-yellow-500', bgGradient: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30', iconColor: 'text-amber-500', emoji: '⭐',
  },
  {
    icon: Truck, title: 'Entregadores Confiáveis',
    description: 'Entregadores avaliados pela comunidade com rastreamento em tempo real da sua entrega.',
    color: 'from-emerald-400 to-teal-500', bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30', iconColor: 'text-emerald-500', emoji: '🚚',
  },
  {
    icon: Store, title: 'Lojas Locais',
    description: 'Compre de lojas do seu bairro. Apoie o comércio local e receba mais rápido.',
    color: 'from-emerald-400 to-teal-500', bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30', iconColor: 'text-emerald-500', emoji: '🏪',
  },
  {
    icon: ShieldCheck, title: 'Pagamento Seguro',
    description: 'Seus dados protegidos com criptografia de ponta. Compre sem preocupação na plataforma.',
    color: 'from-rose-400 to-pink-500', bgGradient: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30', iconColor: 'text-rose-500', emoji: '🔒',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 18 },
  },
}

// Floating community gradient orbs
function CommunityOrb({ color, delay, x, y, size }: { color: string; delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        opacity: 0.4,
      }}
      animate={{
        y: [0, -16, 0],
        x: [0, 8, -6, 0],
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.35, 0.15],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: 'easeInOut' as const,
      }}
      aria-hidden="true"
    />
  )
}

export function CommunityHighlights() {
  return (
    <section className="mt-6 relative overflow-hidden">
      {/* Section Header — enhanced shimmer */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center"
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <Heart className="h-4 w-4 text-white" />
        </motion.div>
        <div>
          <h2 className="text-base sm:text-lg font-bold r18-shimmer-header">Destaques da Comunidade</h2>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            O que torna o DomPlace especial para você
          </p>
        </div>
        {/* Animated community stats badge */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
          className="ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200/40 dark:border-rose-800/30"
        >
          <Users className="h-3.5 w-3.5 text-rose-500" />
          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">12k+ membros</span>
        </motion.div>
      </div>

      {/* Grid: 2x2 desktop, 1 col mobile */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {highlights.map((item) => {
          const Icon = item.icon

          return (
            <motion.div
              key={item.title}
              variants={cardVariants}
              className="group"
            >
              {/* Glassmorphism card — enhanced hover glow */}
              <motion.div
                className="relative overflow-hidden rounded-xl border border-white/20 dark:border-white/10 p-5 sm:p-6 community-highlight-card r36-community-card"
                style={{
                  backdropFilter: 'blur(16px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                }}
                whileHover={{ y: -8, scale: 1.03, boxShadow: '0 0 32px rgba(244, 63, 94, 0.18), 0 12px 32px rgba(0, 0, 0, 0.08)' }}
                transition={{ type: 'spring' as const, stiffness: 280, damping: 20 }}
              >
                {/* Accent gradient line at top — animated shimmer */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${item.color} opacity-60 community-accent-line`} aria-hidden="true" />
                {/* Glass background layer */}
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${item.bgGradient}`}
                  aria-hidden="true"
                />

                {/* Enhanced animated glow */}
                <motion.div
                  className={`absolute -top-8 -right-8 h-28 w-28 rounded-full bg-gradient-to-br ${item.color} opacity-10 blur-2xl`}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.22, 0.1] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden="true"
                />

                {/* Icon with enhanced spring/pulse animation + gradient ring */}
                <motion.div
                  className={`h-11 w-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-4 relative`}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Icon className="h-5 w-5 text-white" />
                  {/* Pulsing ring around icon */}
                  <motion.div
                    className={`absolute inset-0 rounded-xl border-2 border-white/25`}
                    animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.35, 0.15] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 }}
                  />
                </motion.div>

                {/* Title with subtle shimmer */}
                <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">{item.title}</h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.description}</p>

                {/* "Em destaque" animated badge */}
                <motion.div
                  className="absolute top-3 right-3"
                  animate={{ scale: [1, 1.06, 1], y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }}
                >
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm community-destaque-badge">
                    ✨ Em destaque
                  </span>
                </motion.div>

                {/* r36 gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end justify-center pb-4 pointer-events-none z-20">
                  <span className="text-white text-xs font-semibold r36-overlay-text">Ver mais</span>
                </div>

                {/* Story-like circular avatars at bottom */}
                <div className="mt-3 flex items-center gap-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="relative"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.15, type: 'spring' as const, stiffness: 400, damping: 20 }}
                    >
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] community-avatar-ring-${i} r36-avatar-pulse`}>
                        {['😊', '👍', '🎉'][i]}
                      </div>
                    </motion.div>
                  ))}
                  <span className="text-[9px] text-muted-foreground">+128</span>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      {/* Floating community gradient orbs */}
      <CommunityOrb color="#f43f5e" delay={0} x={10} y={20} size={60} />
      <CommunityOrb color="#10b981" delay={2} x={75} y={60} size={50} />
      <CommunityOrb color="#6366f1" delay={4} x={45} y={80} size={55} />
      </motion.div>
    </section>
  )
}
