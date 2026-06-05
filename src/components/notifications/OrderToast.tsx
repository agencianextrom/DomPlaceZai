'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, CheckCircle, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ToastData {
  id: string
  icon: 'info' | 'success'
  iconBg: string
  accentBorder: string
  emoji: string
  message: string
}

const toastQueue: ToastData[] = [
  {
    id: 'toast-1',
    icon: 'info',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    accentBorder: 'border-l-blue-500',
    emoji: '📦',
    message: 'Novo pedido recebido! Pedido #DP0048 — R$67,50',
  },
  {
    id: 'toast-2',
    icon: 'success',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    accentBorder: 'border-l-emerald-500',
    emoji: '✅',
    message: 'Pedido #DP0045 entregue com sucesso!',
  },
]

export function OrderToast() {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const showNextToast = useCallback(() => {
    if (currentIndex >= toastQueue.length - 1) return
    setCurrentIndex((prev) => prev + 1)
    setIsVisible(true)
    setIsDismissed(false)
  }, [currentIndex])

  // Auto-trigger first toast after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex(0)
      setIsVisible(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-dismiss after 5 seconds, then show next after 15 seconds
  useEffect(() => {
    if (!isVisible || currentIndex < 0) return

    const dismissTimer = setTimeout(() => {
      setIsVisible(false)
      setIsDismissed(true)
    }, 5000)

    return () => clearTimeout(dismissTimer)
  }, [isVisible, currentIndex])

  // After dismissing, show next toast after 15 seconds
  useEffect(() => {
    if (!isDismissed) return

    const nextTimer = setTimeout(() => {
      showNextToast()
    }, 15000)

    return () => clearTimeout(nextTimer)
  }, [isDismissed, showNextToast])

  const currentToast = currentIndex >= 0 ? toastQueue[currentIndex] : null

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
  }

  const handleViewOrder = () => {
    toast.info('Abrindo detalhes do pedido...')
    setIsVisible(false)
    setIsDismissed(true)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <div className="max-w-lg mx-auto px-4 pt-4">
        <AnimatePresence>
          {isVisible && currentToast && (
            <motion.div
              key={currentToast.id}
              initial={{ y: -100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -80, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto"
            >
              <div
                className={`
                  bg-white dark:bg-card rounded-xl shadow-lg shadow-black/10 dark:shadow-black/30
                  border border-border/50 ${currentToast.accentBorder} border-l-4
                  p-4 flex items-start gap-3
                `}
              >
                {/* Icon */}
                <div className={`h-10 w-10 rounded-xl ${currentToast.iconBg} flex items-center justify-center shrink-0 text-lg`}>
                  {currentToast.icon === 'info' ? (
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug pr-2">
                    {currentToast.emoji} {currentToast.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 px-2 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={handleViewOrder}
                    >
                      <Eye className="h-3 w-3" />
                      Ver pedido
                    </Button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0 -mt-0.5 -mr-1"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Auto-dismiss progress bar */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className={`h-full ${currentToast.icon === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
