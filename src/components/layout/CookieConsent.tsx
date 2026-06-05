'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Cookie, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

const CONSENT_KEY = 'domplace-cookie-consent'

interface CookiePreferences {
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  analytics: true,
  marketing: false,
  preferences: true,
}

const cookieParticles = [
  { x: '8%', delay: 0, duration: 6 },
  { x: '35%', delay: 2, duration: 7 },
  { x: '70%', delay: 4, duration: 6.5 },
]

function loadConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed && typeof parsed === 'object' && 'analytics' in parsed) {
      return parsed as unknown as CookiePreferences
    }
    // Legacy format (just { accepted: true })
    return null
  } catch {
    return null
  }
}

function saveConsent(prefs: CookiePreferences): void {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      ...prefs,
      date: new Date().toISOString(),
    }))
  } catch {
    // ignore
  }
}

const ACCEPTED_KEY = 'domplace-cookies-accepted'

function markConsented(): void {
  try {
    localStorage.setItem(ACCEPTED_KEY, 'true')
  } catch {
    // ignore
  }
}

function hasPreviouslyConsented(): boolean {
  try {
    // Check both keys for backward compatibility
    return !!(localStorage.getItem(ACCEPTED_KEY) || localStorage.getItem(CONSENT_KEY))
  } catch {
    return false
  }
}

export function CookieConsent() {
  // Read localStorage synchronously via lazy initializer (SSR-safe with typeof window guard).
  // On the server, typeof window === 'undefined' → returns false (banner hidden, no flash).
  // On client hydration / navigation, reads localStorage to check prior consent.
  const [hasConsented, setHasConsented] = useState(() => {
    if (typeof window === 'undefined') return false
    return hasPreviouslyConsented()
  })
  const [visible, setVisible] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    // If user already accepted/rejected cookies, skip showing the banner entirely
    if (hasConsented) return
    // No consent found — show the bar after a small delay for smooth entrance
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [hasConsented])

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true, preferences: true })
    markConsented()
    setHasConsented(true)
    setCustomizeOpen(false)
  }

  const handleRejectAll = () => {
    saveConsent({ analytics: false, marketing: false, preferences: false })
    markConsented()
    setHasConsented(true)
    setCustomizeOpen(false)
  }

  const handleCustomizeOpen = () => {
    setPrefs(DEFAULT_PREFERENCES)
    setCustomizeOpen(true)
  }

  const handleSavePreferences = () => {
    saveConsent(prefs)
    markConsented()
    setHasConsented(true)
    setCustomizeOpen(false)
  }

  const togglePref = (key: keyof CookiePreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Don't render anything if user already consented
  if (hasConsented) return null

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
            className="fixed bottom-16 left-0 right-0 z-50 px-3 sm:px-4 md:bottom-4 r44-cc-slide-up"
          >
            {/* Floating cookie emojis (3 animated with varied effects) */}
            {cookieParticles.map((particle, i) => (
              <motion.span
                key={`cookie-particle-${i}`}
                className={`fixed pointer-events-none select-none text-2xl z-[51] r44-cc-float-${i + 1}`}
                style={{ left: particle.x, bottom: '10%' }}
                animate={{
                  y: [-10, -80],
                  x: [0, 10, -5, 0],
                  opacity: [0, 0.5, 0.3, 0],
                  rotate: [0, 20, -15, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: 'easeInOut',
                }}
              >
                🍪
              </motion.span>
            ))}

            <div className="r44-cc-glass max-w-3xl mx-auto rounded-xl p-4 sm:p-5 relative overflow-hidden r62-card-lift">
              {/* Subtle gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Icon and text */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Animated rotating cookie emoji */}
                  <div className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <motion.span
                      className="r44-cc-cookie-spin absolute text-lg"
                    >
                      🍪
                    </motion.span>
                    <Cookie className="h-5 w-5 relative z-[1]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                      <h3 className="text-sm font-semibold r62-heading-gradient">Sua Privacidade é Importante</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
                      <button
                        onClick={handleCustomizeOpen}
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
                    onClick={handleCustomizeOpen}
                    className="r44-cc-settings-btn text-xs h-9 px-3 flex-1 sm:flex-none border-primary/30 hover:bg-primary/10 hover:text-primary"
                  >
                    <Settings className="h-3.5 w-3.5 mr-1" />
                    Personalizar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="r44-cc-accept-btn relative text-xs min-h-[44px] px-4 flex-1 sm:flex-none bg-accent hover:bg-accent/90 text-accent-foreground font-semibold overflow-hidden"
                  >
                    Aceitar todos
                  </Button>
                </div>
              </div>

              {/* Close / reject button with hover glow */}
              <button
                onClick={handleRejectAll}
                className="r44-cc-close-hover absolute top-2 right-2 min-h-[44px] min-w-[44px] p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                aria-label="Rejeitar e fechar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Preference Customization Dialog */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="max-w-sm p-0 sm:rounded-2xl rounded-t-2xl gap-0 overflow-hidden">
          {/* Header with shimmer */}
          <div className="r44-cc-dialog-header bg-gradient-to-r from-primary to-emerald-600 p-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
                <Settings className="h-5 w-5" />
                Preferências de Cookies
              </DialogTitle>
              <DialogDescription className="text-white/80 text-xs mt-1">
                Escolha quais cookies você deseja aceitar
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Preferences list */}
          <div className="p-5 space-y-4">
            {/* Analytics */}
            <div className="flex items-start gap-3 r44-cc-pref-item">
              <Checkbox
                id="cookie-analytics"
                checked={prefs.analytics}
                onCheckedChange={() => togglePref('analytics')}
                className="mt-0.5 shrink-0"
              />
              <div className="flex-1">
                <label htmlFor="cookie-analytics" className="text-sm font-medium cursor-pointer leading-5">
                  Analytics
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Nos ajudam a entender como você usa o DomPlace para melhorar a plataforma.
                </p>
              </div>
            </div>

            {/* Marketing */}
            <div className="flex items-start gap-3 r44-cc-pref-item">
              <Checkbox
                id="cookie-marketing"
                checked={prefs.marketing}
                onCheckedChange={() => togglePref('marketing')}
                className="mt-0.5 shrink-0"
              />
              <div className="flex-1">
                <label htmlFor="cookie-marketing" className="text-sm font-medium cursor-pointer leading-5">
                  Marketing
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Usados para exibir anúncios e promoções relevantes para você.
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div className="flex items-start gap-3 r44-cc-pref-item">
              <Checkbox
                id="cookie-preferences"
                checked={prefs.preferences}
                onCheckedChange={() => togglePref('preferences')}
                className="mt-0.5 shrink-0"
              />
              <div className="flex-1">
                <label htmlFor="cookie-preferences" className="text-sm font-medium cursor-pointer leading-5">
                  Preferências
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permitem lembrar suas configurações e preferências de navegação.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-border bg-muted/30 flex flex-col gap-2">
            <Button
              size="sm"
              onClick={handleSavePreferences}
              className="r44-cc-save-btn w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              Salvar preferências
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs"
              >
                Aceitar todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="text-xs"
              >
                Rejeitar todos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
