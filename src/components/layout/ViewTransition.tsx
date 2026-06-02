'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface ViewTransitionProps {
  children: ReactNode
  viewKey: string
  className?: string
}

const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.2 },
}

export function ViewTransition({ children, viewKey, className }: ViewTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={variants.transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
