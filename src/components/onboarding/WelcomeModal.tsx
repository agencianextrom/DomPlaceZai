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
import { Dialog, DialogContent } from '@/components/ui/dialog'
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

export function WelcomeModal() {
  const { openAuthModal } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has already seen the welcome
    const welcomed = localStorage.getItem('domplace-welcomed')
    if (!welcomed) {
      // Small delay for a smooth entrance
      const timer = setTimeout(() => setIsOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = useCallback(() => {
    localStorage.setItem('domplace-welcomed', 'true')
    setIsDismissed(true)
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

  // Don't render if already dismissed or never should show
  if (isDismissed) return null

  const currentStep = onboardingSteps[step]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleSkip() }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-0 overflow-hidden border-0 gap-0 bg-background"
      >
        {/* Skip button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted/50"
          >
            Pular
          </button>
        </div>

        {/* Gradient header area */}
        <div className={`relative h-48 sm:h-56 bg-gradient-to-br ${currentStep.gradient} overflow-hidden`}>
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

          {/* Center illustration */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
                {currentStep.title}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs mx-auto">
                {currentStep.subtitle}
              </p>

              {/* Step 2: Extra icons grid */}
              {currentStep.extraIcons && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {currentStep.extraIcons.map(({ Icon, label, color }) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50"
                    >
                      <Icon className={`h-5 w-5 ${color}`} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Step 3: Action buttons */}
              {currentStep.showButtons ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleCreateAccount}
                    className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25"
                  >
                    Criar conta gratuita
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUseWithoutAccount}
                    className="w-full h-11 rounded-xl text-sm"
                  >
                    Usar sem conta
                    <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleNext}
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  size="lg"
                >
                  Continuar
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {onboardingSteps.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setDirection(i > step ? 1 : -1)
                  setStep(i)
                }}
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 h-2.5 bg-primary'
                    : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Ir para etapa ${i + 1}`}
              />
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
