'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Zap, Shield, Bell, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Stagger container for feature highlights
const featureStagger = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
}

const featureItem = {
  initial: { opacity: 0, x: 10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
  },
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [progress, setProgress] = useState(0)
  const isIOS = /iphone|ipad|ipod/.test(typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '')
  const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    // Check if already installed as PWA
    if (isStandalone) return

    // Check if iOS
    const isIos = isIOS

    // Check dismissed
    const dismissed = localStorage.getItem('domplace-pwa-dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    // Android Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Show for iOS after delay
    if (isIos) {
      const iosVisited = sessionStorage.getItem('domplace-ios-pwa-shown')
      if (!iosVisited) {
        setTimeout(() => setShowBanner(true), 3000)
        sessionStorage.setItem('domplace-ios-pwa-shown', '1')
      }
    }

    // Animate progress ring
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2))
    }, 80)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearInterval(interval)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('domplace-pwa-dismissed', Date.now().toString())
  }

  if (!showBanner || isStandalone) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
        transition={{ type: 'spring' as const, damping: 22, stiffness: 280 }}
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[60]"
      >
        {/* Gradient border glow wrapper */}
        <div className="pwa-glass p-[2px] rounded-2xl overflow-hidden">
          <div className="bg-card rounded-2xl p-4 backdrop-blur-xl relative overflow-hidden">

            {/* Dismiss button with enhanced animation */}
            <motion.button
              onClick={handleDismiss}
              whileHover={{ rotate: 90, scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
              className="pwa-dismiss absolute top-2 right-2 h-6 w-6 min-h-[44px] min-w-[44px] rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors z-10"
              aria-label="Fechar prompt de instalação"
            >
              <X className="h-3 w-3" />
            </motion.button>

            <div className="flex items-center gap-3">
              {/* Floating install icon with bounce + progress ring */}
              <div className="relative shrink-0">
                {/* SVG progress ring */}
                <svg className="pwa-progress-ring absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="21"
                    fill="none"
                    stroke="rgba(16,185,129,0.15)"
                    strokeWidth="2.5"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="21"
                    fill="none"
                    stroke="rgba(16,185,129,0.7)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={131.95}
                    strokeDashoffset={131.95 - (progress / 100) * 131.95}
                    animate={{ strokeDashoffset: 131.95 - (progress / 100) * 131.95 }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>

                <motion.div
                  className="pwa-icon-bounce h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg"
                  animate={{
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Smartphone className="h-6 w-6 text-white" />
                </motion.div>
                {/* Pulsing glow behind icon */}
                <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md -z-10 animate-pulse" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">Instalar DomPlace</p>
                <p className="text-[11px] text-muted-foreground">
                  {isIOS
                    ? 'Toque em Compartilhar → Adicionar à Tela de Início'
                    : 'Acesse mais rápido pelo app'}
                </p>
              </div>

              {/* Animated device illustration */}
              <div className="hidden md:block shrink-0">
                <motion.div
                  className="pwa-device-glow"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="28" height="44" viewBox="0 0 28 44" fill="none" className="text-primary">
                    <rect x="1" y="1" width="26" height="42" rx="4" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
                    <rect x="5" y="6" width="18" height="28" rx="1" stroke="currentColor" strokeWidth="1" className="opacity-40" />
                    <circle cx="14" cy="38" r="2" stroke="currentColor" strokeWidth="1" className="opacity-40" />
                    <motion.line
                      x1="10" y1="3" x2="18" y2="3"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="opacity-40"
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Feature highlights with staggered entrance */}
            <motion.div
              className="pwa-features mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5"
              variants={featureStagger}
              initial="initial"
              animate="animate"
            >
              {[
                { icon: Zap, label: 'Rápido' },
                { icon: Shield, label: 'Seguro' },
                { icon: Bell, label: 'Alertas' },
              ].map(({ icon: Icon, label }) => (
                <motion.div
                  key={label}
                  variants={featureItem}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/40"
                >
                  <Icon className="h-3 w-3 text-primary shrink-0" />
                  <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                </motion.div>
              ))}
            </motion.div>

            {!isIOS && (
              <div className="mt-3">
                <Button
                  size="sm"
                  className="relative w-full min-h-[44px] px-3 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 overflow-hidden btn-shine"
                  onClick={handleInstall}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="pwa-shimmer font-bold">Instalar</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
