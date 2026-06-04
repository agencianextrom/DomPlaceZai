'use client'

import { useState, useEffect, useCallback } from 'react'
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

// Emoji particles for onboarding header
const emojiParticles = ['🏪', '🛍️', '⭐', '🎉', '💎', '🔥']

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
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
  initial: { opacity: 0, y: 16, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

export function WelcomeModal() {
  const { openAuthModal } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
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
    handleDismiss()
    setTimeout(() => openAuthModal(), 500)
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
        className="sm:max-w-md p-0 overflow-hidden border-0 gap-0 bg-background"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{currentStep.title}</DialogTitle>
          <DialogDescription>{currentStep.subtitle}</DialogDescription>
        </DialogHeader>

        {/* Animated skip button */}
        <motion.div
          className="absolute top-3 right-3 z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="wm-skip text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted/50"
          >
            Pular
          </motion.button>
        </motion.div>

        {/* Gradient header area with animated gradient border */}
        <div className={`wm-border-glow relative h-48 sm:h-56 bg-gradient-to-br ${currentStep.gradient} overflow-hidden`}>
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

          {/* Floating emoji particles */}
          {emojiParticles.map((emoji, i) => (
            <motion.div
              key={i}
              className="wm-particle absolute pointer-events-none select-none"
              style={{
                left: `${8 + i * 16}%`,
                top: `${15 + (i % 3) * 28}%`,
                fontSize: '16px',
              }}
              animate={{
                y: [0, -18, 0],
                x: [0, (i % 2 === 0 ? 6 : -6), 0],
                opacity: [0.15, 0.5, 0.15],
                rotate: [0, (i % 2 === 0 ? 15 : -15), 0],
                scale: [0.7, 1.1, 0.7],
              }}
              transition={{
                duration: 3.5 + i * 0.6,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            >
              {emoji}
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
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <currentStep.icon className="h-12 w-12 text-white" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content area */}
        <div className="p-6 pt-8 -mt-8 bg-background rounded-t-3xl relative z-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
                {currentStep.title}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs mx-auto">
                {currentStep.subtitle}
              </p>

              {/* Step 2: Extra icons grid with stagger */}
              {currentStep.extraIcons && (
                <motion.div
                  className="grid grid-cols-3 gap-3 mb-4"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {currentStep.extraIcons.map(({ Icon, label, color }) => (
                    <motion.div
                      key={label}
                      variants={staggerItem}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors"
                    >
                      <Icon className={`h-5 w-5 ${color}`} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Step 3: Action buttons with enhanced shimmer */}
              {currentStep.showButtons ? (
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleCreateAccount}
                      className="wm-btn-shimmer w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25 relative overflow-hidden"
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
                    className="wm-btn-shimmer w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25"
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

          {/* Dots indicator with animated glow */}
          <div className="flex items-center justify-center gap-2.5 mt-6">
            {onboardingSteps.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setDirection(i > step ? 1 : -1)
                  setStep(i)
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                className={`wm-step-dot rounded-full transition-all duration-300 relative ${
                  i === step
                    ? 'w-7 h-3 bg-primary'
                    : 'w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Ir para etapa ${i + 1}`}
              >
                {i === step && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                    style={{ background: 'inherit' }}
                  />
                )}
              </motion.button>
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
