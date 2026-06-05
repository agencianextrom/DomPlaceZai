'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Store,
  Search,
  Sparkles,
  ShoppingBag,
  MapPin,
  ChevronRight,
  UtensilsCrossed,
  HeartPulse,
  Wrench,
  PawPrint,
  Scissors,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

const onboardingSteps = [
  {
    title: 'Bem-vindo ao DomPlace!',
    subtitle: 'Seu marketplace local em Dom Eliseu',
    icon: Store,
    gradient: 'from-emerald-500 to-teal-500',
    bgAccent: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Encontre o que precisa',
    subtitle: 'De alimentação a serviços, tudo em um só lugar',
    icon: Search,
    gradient: 'from-amber-500 to-orange-500',
    bgAccent: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    extraIcons: [
      { Icon: UtensilsCrossed, label: 'Alimentação', color: 'text-emerald-600' },
      { Icon: HeartPulse, label: 'Saúde', color: 'text-rose-500' },
      { Icon: Wrench, label: 'Serviços', color: 'text-amber-600' },
      { Icon: PawPrint, label: 'Pets', color: 'text-orange-500' },
      { Icon: Scissors, label: 'Beleza', color: 'text-pink-500' },
      { Icon: ShoppingBag, label: 'Compras', color: 'text-teal-500' },
    ],
  },
  {
    title: 'Comece agora!',
    subtitle: 'Cadastre-se gratuitamente e aproveite ofertas exclusivas',
    icon: Sparkles,
    gradient: 'from-primary to-emerald-600',
    bgAccent: 'bg-primary/10',
    iconColor: 'text-primary',
    showButtons: true,
  },
]

// Emoji particles for onboarding header (12+ with varied colors)
const emojiParticles = [
  { emoji: '🏪', colorClass: 'r44-wm-particle-amber' },
  { emoji: '🛍️', colorClass: 'r44-wm-particle-emerald' },
  { emoji: '⭐', colorClass: 'r44-wm-particle-yellow' },
  { emoji: '🎉', colorClass: 'r44-wm-particle-rose' },
  { emoji: '💎', colorClass: 'r44-wm-particle-sky' },
  { emoji: '🔥', colorClass: 'r44-wm-particle-orange' },
  { emoji: '🛒', colorClass: 'r44-wm-particle-teal' },
  { emoji: '✨', colorClass: 'r44-wm-particle-lime' },
  { emoji: '🎁', colorClass: 'r44-wm-particle-fuchsia' },
  { emoji: '🏆', colorClass: 'r44-wm-particle-cyan' },
  { emoji: '🌟', colorClass: 'r44-wm-particle-violet' },
  { emoji: '🎪', colorClass: 'r44-wm-particle-pink' },
  { emoji: '💎', colorClass: 'r44-wm-particle-emerald' },
  { emoji: '🛍️', colorClass: 'r44-wm-particle-amber' },
]

// Floating gradient orbs configuration (6 orbs)
const floatingOrbs = [
  { color: 'rgba(16, 185, 129, 0.25)', size: 120, top: '10%', left: '5%', duration: 18 },
  { color: 'rgba(245, 158, 11, 0.2)', size: 80, top: '60%', left: '80%', duration: 22 },
  { color: 'rgba(20, 184, 166, 0.18)', size: 100, top: '30%', left: '70%', duration: 15 },
  { color: 'rgba(168, 85, 247, 0.15)', size: 60, top: '70%', left: '15%', duration: 20 },
  { color: 'rgba(236, 72, 153, 0.12)', size: 90, top: '5%', left: '55%', duration: 24 },
  { color: 'rgba(34, 197, 94, 0.2)', size: 70, top: '45%', left: '40%', duration: 17 },
]

// Confetti particles config
const confettiColors = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316']
const confettiShapes = ['circle', 'square', 'triangle']

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    rotateY: direction > 0 ? 8 : -8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    rotateY: direction < 0 ? 8 : -8,
  }),
}

// Stagger container for icon grid
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 16, scale: 0.9, rotateX: 15 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { type: 'tween' as const, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// Modal container variants with spring
const modalContainerVariants = {
  hidden: {
    opacity: 0,
    scale: 0.88,
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'tween' as const,
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 30,
    transition: {
      type: 'tween' as const,
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

// Confetti particle component
function ConfettiParticle({ color, index, total }: { color: string; index: number; total: number }) {
  const angle = (360 / total) * index + (Math.random() * 30 - 15)
  const radians = (angle * Math.PI) / 180
  const velocity = 80 + Math.random() * 120
  const shape = confettiShapes[index % confettiShapes.length]

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: shape === 'circle' ? 8 : 6,
        height: shape === 'circle' ? 8 : shape === 'square' ? 6 : 10,
        borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '1px',
        background: color,
        clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
        left: '50%',
        top: '50%',
      }}
      initial={{
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        rotate: 0,
      }}
      animate={{
        x: Math.cos(radians) * velocity,
        y: Math.sin(radians) * velocity - 40,
        opacity: 0,
        scale: 0.3,
        rotate: angle * 2,
      }}
      transition={{
        type: 'tween' as const,
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    />
  )
}

export function WelcomeModal() {
  const { openAuthModal } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [confettiBurst, setConfettiBurst] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const [hasChecked, setHasChecked] = useState(() => {
    if (typeof window === 'undefined') return false
    const onboardingDone = localStorage.getItem('domplace-onboarding-done')
    const welcomed = localStorage.getItem('domplace-welcomed')
    return onboardingDone === 'true' || welcomed === 'true'
  })

  useEffect(() => {
    // If already completed, skip the modal entirely
    if (hasChecked) return
    // Small delay for a smooth entrance
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [hasChecked])

  const handleDismiss = useCallback(() => {
    localStorage.setItem('domplace-welcomed', 'true')
    localStorage.setItem('domplace-onboarding-done', 'true')
    setIsOpen(false)
  }, [])

  const handleSkip = useCallback(() => {
    handleDismiss()
  }, [handleDismiss])

  const handleNext = useCallback(() => {
    if (step < onboardingSteps.length - 1) {
      setDirection(1)
      setStep((prev) => prev + 1)
    }
  }, [step])

  const handleBack = useCallback(() => {
    if (step > 0) {
      setDirection(-1)
      setStep((prev) => prev - 1)
    }
  }, [step])

  const handleCreateAccount = useCallback(() => {
    setConfettiBurst(true)
    setTimeout(() => {
      handleDismiss()
      setTimeout(() => openAuthModal(), 500)
    }, 600)
  }, [handleDismiss, openAuthModal])

  const handleUseWithoutAccount = useCallback(() => {
    handleDismiss()
  }, [handleDismiss])

  // Don't render if already completed onboarding
  if (hasChecked && !isOpen) return null

  const currentStep = onboardingSteps[step]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleSkip() }}>
      <DialogContent
        showCloseButton={false}
        className="r44-wm-modal-outer sm:max-w-md p-0 overflow-hidden border-0 gap-0 bg-background"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.subtitle}</DialogDescription>
        </DialogHeader>

        {/* Backdrop blur+scale entrance overlay */}
        <div className="r44-wm-backdrop absolute inset-0 rounded-xl bg-black/20 backdrop-blur-sm -z-10 pointer-events-none" />

        {/* Gradient animated border on modal container */}
        <div className="r44-wm-animated-border absolute inset-0 rounded-xl pointer-events-none z-0" />

        {/* 6 Floating gradient orbs background */}
        {floatingOrbs.map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            className="r44-wm-orb absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              top: orb.top,
              left: orb.left,
            }}
            animate={{
              x: [0, 30 * (i % 2 === 0 ? 1 : -1), -20 * (i % 2 === 0 ? 1 : -1), 0],
              y: [0, -25 * (i % 3 === 0 ? 1 : -1), 15 * (i % 3 === 0 ? 1 : -1), 0],
              scale: [1, 1.15, 0.9, 1.05, 1],
              opacity: [0.6, 0.9, 0.5, 0.8, 0.6],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.7,
            }}
          />
        ))}

        {/* Animated close button with glow hover */}
        <motion.div
          className="absolute top-3 right-3 z-20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="r44-wm-close-btn flex items-center justify-center w-8 h-8 min-h-[44px] min-w-[44px] rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </motion.div>

        {/* Gradient header area with animated gradient border and shimmer */}
        <div className={`r44-wm-header relative h-48 sm:h-56 bg-gradient-to-br ${currentStep.gradient} overflow-hidden`}>
          {/* Decorative circles */}
          <motion.div
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10"
            animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-8 right-16 w-16 h-16 rounded-full bg-white/5"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Floating emoji particles (12+ with varied colors) */}
          {emojiParticles.map((particle, i) => (
            <motion.div
              key={i}
              className={`r44-wm-particle ${particle.colorClass} absolute pointer-events-none select-none`}
              style={{
                left: `${5 + (i % 7) * 13.5}%`,
                top: `${8 + (i % 4) * 24}%`,
                fontSize: i % 3 === 0 ? '18px' : i % 3 === 1 ? '14px' : '16px',
              }}
              animate={{
                y: [0, -20 - (i % 3) * 8, 0],
                x: [0, (i % 2 === 0 ? 8 : -8), 0],
                opacity: [0.1, 0.55, 0.1],
                rotate: [0, (i % 2 === 0 ? 20 : -20), 0],
                scale: [0.65, 1.15, 0.65],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeInOut',
              }}
            >
              {particle.emoji}
            </motion.div>
          ))}

          {/* Gradient shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
          />

          {/* Center illustration */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween' as const, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ perspective: 600 }}
            >
              <motion.div
                className="r44-wm-icon-box w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}
              >
                <currentStep.icon className="h-12 w-12 text-white" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content area with enhanced shadow */}
        <div ref={modalRef} className="r44-wm-content-area p-6 pt-8 -mt-8 rounded-t-3xl relative z-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween' as const, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ perspective: 800 }}
            >
              {/* Shimmer text effect on modal title */}
              <h2 className="r44-wm-shimmer-title text-xl sm:text-2xl font-bold text-center mb-2">
                {currentStep.title}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs mx-auto">
                {currentStep.subtitle}
              </p>

              {/* Step 2: Extra icons grid with 3D perspective tilt */}
              {currentStep.extraIcons && (
                <motion.div
                  className="r44-wm-features-grid grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  style={{ perspective: 600 }}
                >
                  {currentStep.extraIcons.map(({ Icon, label, color }, idx) => (
                    <motion.div
                      key={label}
                      variants={staggerItem}
                      className="r44-wm-feature-card flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-default"
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                      whileHover={{
                        rotateY: 8,
                        rotateX: -5,
                        scale: 1.05,
                        transition: { type: 'tween' as const, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                      }}
                    >
                      <div
                        className="r44-wm-feature-icon-wrap flex items-center justify-center w-10 h-10 rounded-lg bg-background/60"
                        style={{ transform: 'translateZ(20px)' }}
                      >
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Step 3: Action buttons with confetti burst */}
              {currentStep.showButtons ? (
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleCreateAccount}
                      className="r44-wm-btn-shimmer r44-wm-btn-glow-ring w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 relative overflow-hidden"
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                      />
                      <span className="relative z-10">
                        Criar conta gratuita
                        <Sparkles className="h-4 w-4 ml-2" />
                      </span>

                      {/* Confetti burst on CTA click */}
                      <AnimatePresence>
                        {confettiBurst && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center overflow-visible"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                          >
                            {confettiColors.map((color, i) => (
                              <ConfettiParticle
                                key={`confetti-${i}`}
                                color={color}
                                index={i}
                                total={confettiColors.length}
                              />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      onClick={handleUseWithoutAccount}
                      className="w-full h-11 rounded-xl text-sm hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      Usar sem conta
                      <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleNext}
                    className="r44-wm-btn-shimmer r44-wm-btn-glow-ring w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90"
                    size="lg"
                  >
                    Continuar
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </motion.div>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Enhanced slide indicators with glowing active dot and connecting line */}
          <div className="r44-wm-indicators flex items-center justify-center gap-0 mt-6">
            {onboardingSteps.map((_, i) => (
              <div key={i} className="flex items-center">
                {/* Connecting line between dots */}
                {i > 0 && (
                  <div className="r44-wm-dot-connector w-6 h-px mx-1 relative">
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: i <= step ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 0, 0, 0.08)' }}
                      animate={i <= step ? { scaleX: [0, 1] } : { scaleX: 1 }}
                      transition={{ type: 'tween' as const, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94], delay: i <= step ? 0.1 : 0 }}
                      initial={{ originX: 0 }}
                    />
                  </div>
                )}
                <motion.button
                  onClick={() => {
                    setDirection(i > step ? 1 : -1)
                    setStep(i)
                  }}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`r44-wm-dot rounded-full transition-all duration-300 relative ${
                    i === step
                      ? 'w-7 h-3 bg-primary r44-wm-dot-active'
                      : 'w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Ir para etapa ${i + 1}`}
                >
                  {/* Glowing active dot with pulsing ring */}
                  {i === step && (
                    <>
                      <div className="r44-wm-dot-ring" />
                      <motion.span
                        className="r44-wm-dot-glow absolute inset-0 rounded-full"
                        animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                        style={{ background: '#10b981' }}
                      />
                      <motion.span
                        className="r44-wm-dot-inner-glow absolute inset-0 rounded-full"
                        animate={{ boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)' }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    </>
                  )}
                </motion.button>
              </div>
            ))}
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-muted-foreground mt-3">
            {step + 1} de {onboardingSteps.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
