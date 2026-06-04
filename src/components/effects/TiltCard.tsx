'use client'

import { useRef, type ReactNode } from 'react'
import { use3dTilt } from '@/lib/use-3d-tilt'

interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  glare?: boolean
}

export function TiltCard({ children, className, maxTilt = 6, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { onMouseMove, onMouseLeave, transform, glareStyle } = use3dTilt(ref, {
    maxTilt,
    glare,
    scale: 1.02,
    speed: 400,
  })

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className || ''}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transform, transition: 'transform 0.1s ease-out' }}
    >
      {children}
      {glare && (
        <div
          style={glareStyle}
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
        />
      )}
    </div>
  )
}
