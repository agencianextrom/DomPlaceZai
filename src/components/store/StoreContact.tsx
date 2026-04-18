'use client'

import { useState, useMemo } from 'react'
import {
  Phone, MessageCircle, Mail, MapPin, Clock, ExternalLink, Send, X,
  Navigation
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore, type StoreData } from '@/store/useAppStore'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface StoreContactProps {
  store: StoreData
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function StoreContact({ store }: StoreContactProps) {
  const { toggleChat } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)

  const isOpenNow = useMemo(() => {
    if (!store.opensAt || !store.closesAt) return true
    const now = new Date()
    const brasiliaOffset = -3
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const brasiliaTime = new Date(utc + brasiliaOffset * 3600000)
    const [h, m] = store.opensAt.split(':').map(Number)
    const [eh, em] = store.closesAt.split(':').map(Number)
    const currentMins = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes()
    return currentMins >= (h * 60 + m) && currentMins <= (eh * 60 + em)
  }, [store.opensAt, store.closesAt])

  const openDaysList = store.openDays ? store.openDays.split(',').map(Number) : [1, 2, 3, 4, 5, 6, 7]

  const handleWhatsApp = () => {
    const phone = store.whatsapp?.replace(/\D/g, '') || store.phone?.replace(/\D/g, '')
    if (phone) {
      window.open(`https://wa.me/55${phone}`, '_blank')
    }
  }

  const handleCall = () => {
    if (store.phone) {
      window.open(`tel:${store.phone.replace(/\D/g, '')}`, '_self')
    }
  }

  const handleEmail = () => {
    toast.info('Funcionalidade de e-mail em breve!')
  }

  const handleChat = () => {
    toast.success(`Abrindo chat com ${store.name}...`)
    toggleChat()
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-emerald-700 text-white shadow-xl flex items-center justify-center"
            aria-label="Opções de contato"
          >
            <Phone className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Contact Panel (Sheet-like) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Contato</h3>
                    <p className="text-sm text-muted-foreground">{store.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Open/Closed indicator */}
                <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl ${
                  isOpenNow
                    ? 'bg-emerald-50 dark:bg-emerald-900/10'
                    : 'bg-red-50 dark:bg-red-900/10'
                }`}>
                  <div className={`h-2.5 w-2.5 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${isOpenNow ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    {isOpenNow ? 'Aberto agora' : 'Fechado'}
                  </span>
                  {store.opensAt && store.closesAt && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {store.opensAt} - {store.closesAt}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Store Hours */}
              <div className="px-5 py-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Horário de funcionamento
                </h4>
                <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const isToday = new Date().getDay() === day
                    const isOpenDay = openDaysList.includes(day)
                    return (
                      <div
                        key={day}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${
                          isToday ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                          {dayNames[day]}{isToday ? ' (hoje)' : ''}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${isOpenDay ? 'bg-emerald-500' : 'bg-red-400/50'}`} />
                          <span className={`text-xs ${!isOpenDay ? 'text-muted-foreground/50' : isToday ? 'font-medium' : ''}`}>
                            {isOpenDay ? `${store.opensAt} - ${store.closesAt}` : 'Fechado'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Contact buttons */}
              <div className="px-5 py-4 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Entrar em contato
                </h4>

                {/* WhatsApp */}
                {(store.whatsapp || store.phone) && (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsApp}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all shadow-md"
                  >
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm">WhatsApp</p>
                      <p className="text-xs text-white/70">{store.whatsapp || store.phone}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-white/60" />
                  </motion.button>
                )}

                {/* Phone */}
                {store.phone && (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCall}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-primary/10 hover:bg-primary/15 transition-all"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm">Ligar</p>
                      <p className="text-xs text-muted-foreground">{store.phone}</p>
                    </div>
                  </motion.button>
                )}

                {/* Email */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmail}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm">E-mail</p>
                    <p className="text-xs text-muted-foreground">Enviar mensagem por e-mail</p>
                  </div>
                </motion.button>

                {/* Chat */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChat}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 transition-all border border-amber-200/50 dark:border-amber-800/30"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                    <Send className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm">Chat DomPlace</p>
                    <p className="text-xs text-muted-foreground">Converse com a loja pelo app</p>
                  </div>
                </motion.button>
              </div>

              <Separator />

              {/* Map placeholder */}
              <div className="px-5 py-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Localização
                </h4>
                <div className="h-40 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.2) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }} />
                  {/* Simulated map elements */}
                  <div className="absolute top-4 left-1/4 w-20 h-3 bg-amber-200/50 rounded-full dark:bg-amber-800/20" />
                  <div className="absolute top-12 right-1/4 w-16 h-3 bg-amber-200/50 rounded-full dark:bg-amber-800/20" />
                  <div className="absolute bottom-10 left-1/3 w-24 h-3 bg-amber-200/50 rounded-full dark:bg-amber-800/20" />
                  <div className="absolute top-8 right-10 w-12 h-12 bg-primary/10 rounded-full border-2 border-dashed border-primary/20" />
                  <div className="absolute bottom-6 right-1/3 w-8 h-8 bg-emerald-100 rounded-full border-2 border-dashed border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700/30" />

                  {/* Center pin */}
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10 text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <MapPin className="h-8 w-8 text-primary mx-auto" />
                    </motion.div>
                  </motion.div>
                </div>
                {store.address && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs">{store.address}, {store.neighborhood || ''} - {store.city}/{store.state}</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 gap-2 text-xs"
                  onClick={() => {
                    const address = `${store.address}, ${store.city} ${store.state}`
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank')
                  }}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Abrir no Google Maps
                </Button>
              </div>

              {/* Bottom padding for mobile */}
              <div className="h-6 md:h-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
