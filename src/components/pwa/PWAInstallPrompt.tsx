'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
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

    return () => window.removeEventListener('beforeinstallprompt', handler)
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
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[60] bg-card border border-border rounded-2xl shadow-xl p-4 backdrop-blur-xl"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
        >
          <X className="h-3 w-3" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Instalar DomPlace</p>
            <p className="text-[11px] text-muted-foreground">
              {isIOS 
                ? 'Toque em Compartilhar → Adicionar à Tela de Início'
                : 'Acesse mais rápido pelo app'}
            </p>
          </div>
          {!isIOS && (
            <Button size="sm" className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shrink-0" onClick={handleInstall}>
              <Download className="h-3.5 w-3.5" />
              Instalar
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
