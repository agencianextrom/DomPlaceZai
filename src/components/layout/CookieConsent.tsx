'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Cookie, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CONSENT_KEY = 'domplace-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if user already consented
    try {
      const consent = localStorage.getItem(CONSENT_KEY)
      if (!consent) {
        // Small delay for smooth entrance
        const timer = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage not available, show banner anyway
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }))
    } catch {
      // ignore
    }
    setVisible(false)
  }

  const handleCustomize = () => {
    // Placeholder for future cookie customization panel
    handleAcceptAll()
  }

  const handleDismiss = () => {
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-16 left-0 right-0 z-50 px-3 sm:px-4 md:bottom-4"
        >
          <div className="glass-card max-w-3xl mx-auto rounded-xl border border-primary/20 p-4 sm:p-5 shadow-lg relative overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon and text */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Cookie className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-sm font-semibold">Sua Privacidade é Importante</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
                    <button
                      onClick={handleCustomize}
                      className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium"
                    >
                      Política de Privacidade
                    </button>.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomize}
                  className="text-xs h-9 px-3 flex-1 sm:flex-none border-primary/30 hover:bg-primary/10 hover:text-primary"
                >
                  Personalizar
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="text-xs h-9 px-4 flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Aceitar todos
                </Button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
