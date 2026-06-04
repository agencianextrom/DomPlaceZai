'use client'

import { cn } from '@/lib/utils'

/* ─── Preset layout variants ─── */

interface SkeletonEnhancedProps {
  /** Preset layout: card, list, grid, detail, stat */
  variant?: 'card' | 'list' | 'grid' | 'detail' | 'stat'
  /** Number of rows/lines for custom variant (default: 3) */
  lines?: number
  /** Additional CSS class names */
  className?: string
  /** Animation speed multiplier (default: 1) */
  speed?: number
}

/**
 * SkeletonEnhanced — loading skeleton with a shimmer sweep animation.
 * Multiple layout presets for common UI patterns.
 */
export function SkeletonEnhanced({
  variant = 'card',
  lines = 3,
  className,
  speed = 1,
}: SkeletonEnhancedProps) {
  const shimmerBase = (
    <style>{`
      @keyframes skeleton-enhanced-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .skel-enhanced-shimmer {
        background: linear-gradient(
          90deg,
          oklch(0.95 0.005 120) 0%,
          oklch(0.95 0.005 120) 35%,
          oklch(0.92 0.015 120) 50%,
          oklch(0.95 0.005 120) 65%,
          oklch(0.95 0.005 120) 100%
        );
        background-size: 200% 100%;
        animation: skeleton-enhanced-shimmer ${1.8 / speed}s ease-in-out infinite;
        border-radius: 8px;
      }
      .dark .skel-enhanced-shimmer {
        background: linear-gradient(
          90deg,
          oklch(0.22 0.015 150) 0%,
          oklch(0.22 0.015 150) 35%,
          oklch(0.28 0.02 150) 50%,
          oklch(0.22 0.015 150) 65%,
          oklch(0.22 0.015 150) 100%
        );
        background-size: 200% 100%;
      }
    `}</style>
  )

  if (variant === 'card') {
    return (
      <>
        {shimmerBase}
        <div className={cn('rounded-xl border border-border/40 overflow-hidden p-3', className)}>
          {/* Image placeholder */}
          <div className="skel-enhanced-shimmer w-full aspect-square rounded-lg mb-3" />
          {/* Text lines */}
          <div className="skel-enhanced-shimmer h-3.5 w-3/4 mb-2 rounded" />
          <div className="skel-enhanced-shimmer h-3 w-1/2 mb-3 rounded" />
          {/* Price */}
          <div className="skel-enhanced-shimmer h-5 w-1/3 rounded" />
        </div>
      </>
    )
  }

  if (variant === 'list') {
    return (
      <>
        {shimmerBase}
        <div className={cn('space-y-3', className)}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skel-enhanced-shimmer h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skel-enhanced-shimmer h-3.5 w-3/4 rounded" />
                <div className="skel-enhanced-shimmer h-2.5 w-1/2 rounded" />
              </div>
              <div className="skel-enhanced-shimmer h-4 w-12 rounded" />
            </div>
          ))}
        </div>
      </>
    )
  }

  if (variant === 'grid') {
    return (
      <>
        {shimmerBase}
        <div className={cn('grid grid-cols-2 gap-3', className)}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/40 overflow-hidden p-3">
              <div className="skel-enhanced-shimmer w-full aspect-square rounded-lg mb-2" />
              <div className="skel-enhanced-shimmer h-3 w-3/4 mb-1 rounded" />
              <div className="skel-enhanced-shimmer h-4 w-1/3 rounded" />
            </div>
          ))}
        </div>
      </>
    )
  }

  if (variant === 'detail') {
    return (
      <>
        {shimmerBase}
        <div className={cn('space-y-4', className)}>
          {/* Hero image */}
          <div className="skel-enhanced-shimmer w-full h-48 rounded-xl" />
          {/* Title + price */}
          <div className="skel-enhanced-shimmer h-5 w-3/4 rounded" />
          <div className="skel-enhanced-shimmer h-7 w-1/3 rounded" />
          {/* Description lines */}
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skel-enhanced-shimmer h-3 rounded" style={{ width: `${90 - i * 15}%` }} />
            ))}
          </div>
          {/* Action button */}
          <div className="skel-enhanced-shimmer h-11 w-full rounded-xl" />
        </div>
      </>
    )
  }

  if (variant === 'stat') {
    return (
      <>
        {shimmerBase}
        <div className={cn('flex items-center gap-3 p-3 rounded-xl border border-border/40', className)}>
          <div className="skel-enhanced-shimmer h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skel-enhanced-shimmer h-3 w-12 rounded" />
            <div className="skel-enhanced-shimmer h-5 w-8 rounded" />
          </div>
          <div className="skel-enhanced-shimmer h-1.5 w-full rounded-full" />
        </div>
      </>
    )
  }

  // Fallback: custom lines
  return (
    <>
      {shimmerBase}
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skel-enhanced-shimmer rounded"
            style={{ height: 14, width: `${80 - i * 12}%` }}
          />
        ))}
      </div>
    </>
  )
}
