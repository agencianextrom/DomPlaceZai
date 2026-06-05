'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle, Clock, Package, Truck, ChefHat, XCircle,
  Check,
} from 'lucide-react'

interface TimelineStep {
  label: string
  status: 'completed' | 'current' | 'pending'
  timestamp?: string
  icon?: string
  desc?: string
  estLabel?: string
}

interface OrderStatusTimelineProps {
  steps: TimelineStep[]
}

const iconMap: Record<string, React.ElementType> = {
  confirmed: CheckCircle,
  preparing: ChefHat,
  delivering: Truck,
  delivered: Package,
  cancelled: XCircle,
}

// Mini confetti burst for completed steps
function StepConfetti() {
  const colors = ['#10b981', '#f59e0b', '#06b6d4', '#f97316', '#84cc16']
  const shapes = ['●', '■', '▲']

  return (
    <div className="absolute -top-1 -left-1 pointer-events-none">
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const distance = 8 + Math.random() * 10
        const tx = Math.cos(angle) * distance
        const ty = Math.sin(angle) * distance - 4

        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: tx, y: ty, scale: 0, opacity: 0, rotate: (Math.random() - 0.5) * 360 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.04, ease: [0, 0, 0.2, 1] as const }}
            className="absolute left-1/2 top-1/2"
            style={{
              color: colors[i % colors.length],
              fontSize: '5px',
              lineHeight: 1,
            }}
          >
            {shapes[i % shapes.length]}
          </motion.span>
        )
      })}
    </div>
  )
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const stepVariants = {
  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
}

export function OrderStatusTimeline({ steps }: OrderStatusTimelineProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative r33-timeline-shimmer r62-card-lift r99-timeline-card"
    >
      {/* Animated connecting line behind the steps */}
      <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border/40">
        <motion.div
          className="w-full bg-gradient-to-b from-primary via-emerald-500 to-primary rounded-full r33-line-fill"
          initial={{ height: '0%' }}
          animate={{ height: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` }}
          transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        />
      </div>

      <div className="space-y-0">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed'
          const isCurrent = step.status === 'current'
          const isPending = step.status === 'pending'
          const IconComponent = step.icon ? iconMap[step.icon] || CheckCircle : CheckCircle
          const isLast = idx === steps.length - 1

          return (
            <motion.div
              key={idx}
              variants={stepVariants}
              className={`flex gap-3 ${isLast ? '' : 'pb-5'}`}
            >
              {/* Step circle */}
              <div className="relative shrink-0">
                <motion.div
                  className={`h-9 w-9 rounded-full flex items-center justify-center relative r33-step-pop ${
                    isCompleted
                      ? 'bg-gradient-to-br from-primary to-emerald-500 text-white shadow-md shadow-primary/20'
                      : isCurrent
                        ? 'bg-primary/10 text-primary ring-[3px] ring-primary/20'
                        : 'bg-muted text-muted-foreground/50'
                  }`}
                  {...(isCurrent
                    ? {
                        animate: {
                          boxShadow: [
                            '0 0 0 0 rgba(16,185,129,0.2)',
                            '0 0 0 8px rgba(16,185,129,0)',
                          ],
                        },
                        transition: { duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] as const },
                      }
                    : {})}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      {...(isCurrent
                        ? {
                            animate: { scale: [1, 1.15, 1] },
                            transition: { duration: 2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] as const },
                          }
                        : {})}
                    >
                      <IconComponent className="h-4 w-4" />
                    </motion.div>
                  )}

                  {/* Confetti burst for the latest completed step */}
                  {isCompleted && (idx === 0 || steps[idx - 1].status !== 'completed') && (
                    <StepConfetti />
                  )}
                </motion.div>
              </div>

              {/* Step content */}
              <div className={`flex-1 pt-1 r33-label-fade ${isPending ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted
                        ? 'text-foreground'
                        : isCurrent
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  {/* Estimated time chip for non-completed steps */}
                  {!isCompleted && step.estLabel && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {step.estLabel}
                    </span>
                  )}
                  {/* Completed badge */}
                  {isCompleted && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Concluído
                    </span>
                  )}
                </div>
                {/* Step description */}
                {!isPending && step.desc && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-muted-foreground mt-0.5"
                  >
                    {step.desc}
                  </motion.p>
                )}
                {step.timestamp && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"
                  >
                    <Clock className="h-2.5 w-2.5" />
                    {step.timestamp}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
