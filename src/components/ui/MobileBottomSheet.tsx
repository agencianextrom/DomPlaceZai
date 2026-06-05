'use client'

import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxHeight?: string
  className?: string
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '85vh',
  className = '',
}: MobileBottomSheetProps) {
  const [dragY, setDragY] = useState(0)
  const controls = useDragControls()

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose()
      }
      setDragY(0)
    },
    [onClose],
  )

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[60] r93-bottomsheet-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet panel */}
          <motion.div
            className={`fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl ${className}`}
            style={{
              maxHeight,
              overscrollBehavior: 'contain',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.12), 0 -1px 8px rgba(0,0,0,0.06)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: dragY > 0 ? dragY : 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring' as const, damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={controls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Painel inferior'}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Title bar */}
            {title && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-transform"
                  aria-label="Fechar"
                >
                  <span className="text-gray-500 dark:text-gray-400 text-xl leading-none" aria-hidden="true">
                    &times;
                  </span>
                </button>
              </div>
            )}

            {/* Scrollable content area */}
            <div
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: 'calc(85vh - 56px)' }}
            >
              {children}
            </div>

            {/* Safe area bottom padding for notched devices */}
            <div
              className="bg-white dark:bg-gray-900"
              style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
