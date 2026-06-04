'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface ViewTransitionProps {
  children: ReactNode
  viewKey: string
  className?: string
  /** Override navigation direction; auto-detected from view history when omitted */
  direction?: 'forward' | 'back'
}

// ---------------------------------------------------------------------------
// Directional slide variants – forward slides right-to-left, back slides left-to-right
// ---------------------------------------------------------------------------
const slideVariants = {
  initial: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? 60 : -60,
    scale: 0.98,
    filter: 'blur(6px)',
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? -60 : 60,
    scale: 0.96,
    filter: 'blur(6px)',
  }),
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
}

// Skeleton micro-variants (no custom prop needed)
const skeletonVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const skeletonTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as const,
}

// Staggered child variants for content entrance
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ViewTransition({
  children,
  viewKey,
  className,
  direction: directionProp,
}: ViewTransitionProps) {
  // ---- refs for latest-prop access inside timeouts ----
  const directionPropRef = useRef(directionProp)
  directionPropRef.current = directionProp

  const childrenRef = useRef(children)
  childrenRef.current = children

  // Navigation history for automatic direction inference
  const viewHistoryRef = useRef<string[]>([viewKey])

  // ---- state ----
  const [activeViewKey, setActiveViewKey] = useState(viewKey)
  const [activeChildren, setActiveChildren] = useState<ReactNode>(children)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [currentDirection, setCurrentDirection] = useState<'forward' | 'back'>(
    'forward',
  )
  const [progress, setProgress] = useState(0)
  const [transitionId, setTransitionId] = useState(0)
  const [bgShift, setBgShift] = useState(false)

  const direction = directionProp ?? currentDirection

  // ---- transition orchestrator ----
  useEffect(() => {
    if (viewKey === activeViewKey) return

    // Infer direction from view history
    const dir =
      directionPropRef.current ??
      (viewHistoryRef.current.includes(viewKey) ? 'back' : 'forward')
    setCurrentDirection(dir)

    // Maintain navigation history
    if (dir === 'back') {
      viewHistoryRef.current.pop()
    } else {
      viewHistoryRef.current.push(viewKey)
    }

    // Phase 1: show skeleton + progress bar
    setIsTransitioning(true)
    setShowContent(false)
    setProgress(0)
    setTransitionId((prev) => prev + 1)
    setBgShift(true)

    // Animate the progress bar smoothly
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 12, 85))
    }, 60)

    // Phase 2: after skeleton delay, swap to real content
    const timer = setTimeout(() => {
      clearInterval(progressInterval)
      setProgress(100)

      // Brief pause so the bar visually reaches 100 %
      const revealTimer = setTimeout(() => {
        setActiveViewKey(viewKey)
        setActiveChildren(childrenRef.current)
        setShowContent(true)
        setIsTransitioning(false)
        setProgress(0)
        setBgShift(false)
      }, 150)

      return () => clearTimeout(revealTimer)
    }, 500)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [viewKey, activeViewKey])

  // ---- derived keys for AnimatePresence ----
  const contentKey = `content-${activeViewKey}`
  const skeletonKey = `skeleton-${transitionId}`

  return (
    <>
      {/* ── Background color transition overlay ── */}
      <AnimatePresence>
        {bgShift && (
          <motion.div
            className="vt-bg-shift fixed inset-0 z-[45] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* ── Shimmer overlay during transition ── */}
      <AnimatePresence>
        {isTransitioning && !showContent && (
          <motion.div
            className="vt-shimmer-overlay fixed inset-0 z-[46] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      {/* ── Emerald progress bar at the very top ── */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-50 h-[2px]"
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Subtle backdrop blur during transition ── */}
      <AnimatePresence>
        {isTransitioning && !showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed inset-0 z-40 bg-background/30 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* ── Main content / skeleton swap ── */}
      <AnimatePresence mode="wait" custom={direction}>
        {showContent ? (
          <motion.div
            key={contentKey}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springTransition}
            className={`vt-fade-slide ${className || ''}`}
          >
            {/* Staggered content entrance wrapper */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              key={`stagger-${contentKey}`}
            >
              <motion.div variants={staggerItem}>
                {activeChildren}
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={skeletonKey}
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={skeletonTransition}
            className={className}
          >
            {/* Brief skeleton placeholder — 2 shimmer lines */}
            <div className="space-y-3 p-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
