'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface ConfettiBurstProps {
  /** Whether the confetti burst is active */
  active: boolean
  /** Called when the animation completes and auto-cleans up */
  onComplete?: () => void
  /** Number of particles (default: 40) */
  particleCount?: number
  /** Duration in ms (default: 1000) */
  duration?: number
  /** Spread radius in px (default: 200) */
  spread?: number
  /** Origin position: 'center', 'top', 'bottom', {x, y} */
  origin?: 'center' | 'top' | 'bottom' | { x: number; y: number }
  /** CSS class for the container */
  className?: string
}

interface Particle {
  id: number
  color: string
  size: number
  x: number
  y: number
  rotation: number
  velocityX: number
  velocityY: number
  rotationSpeed: number
  shape: 'circle' | 'rect' | 'star'
}

const CONFETTI_COLORS = [
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#84cc16', // lime
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
]

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

let particleId = 0

/**
 * ConfettiBurst — a lightweight CSS-based confetti burst animation.
 * No external dependencies. Auto-cleans up after animation completes.
 */
export function ConfettiBurst({
  active,
  onComplete,
  particleCount = 40,
  duration = 1000,
  spread = 200,
  origin = 'center',
  className = '',
}: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const velocity = randomRange(2, spread / 30)
      const shapes: Array<'circle' | 'rect' | 'star'> = ['circle', 'rect', 'star']
      newParticles.push({
        id: particleId++,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: randomRange(4, 10),
        x: 0,
        y: 0,
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - randomRange(2, 6),
        rotationSpeed: randomRange(-15, 15),
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    }
    return newParticles
  }, [particleCount, spread])

  // Trigger animation when active becomes true
  useEffect(() => {
    if (!active) return

    setParticles(createParticles())

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [active, createParticles])

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return

    const GRAVITY = 0.12
    const FRICTION = 0.98

    startTimeRef.current = performance.now()

    function frame(now: number) {
      if (startTimeRef.current === null) return

      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.velocityX * FRICTION,
          y: p.y + p.velocityY + GRAVITY,
          velocityY: p.velocityY + GRAVITY,
          velocityX: p.velocityX * FRICTION,
          rotation: p.rotation + p.rotationSpeed,
        }))
      )

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        // Animation complete — cleanup
        setParticles([])
        startTimeRef.current = null
        onComplete?.()
      }
    }

    rafRef.current = requestAnimationFrame(frame)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [particles.length > 0, duration, onComplete])

  // Compute origin transform
  const getOriginStyle = (): React.CSSProperties => {
    if (origin === 'center') return {}
    if (origin === 'top') return { top: '0', left: '50%', transform: 'translateX(-50%)' }
    if (origin === 'bottom') return { bottom: '0', left: '50%', transform: 'translateX(-50%)' }
    if (typeof origin === 'object') return { left: `${origin.x}px`, top: `${origin.y}px` }
    return {}
  }

  if (particles.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden z-50 ${className}`}
      style={{ ...getOriginStyle() }}
      aria-hidden="true"
    >
      {particles.map((p) => {
        const opacity = Math.max(0, 1 - (performance.now() - (startTimeRef.current || performance.now())) / duration)

        if (p.shape === 'circle') {
          return (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
                opacity: 0.9,
                willChange: 'transform, opacity',
              }}
            />
          )
        }

        if (p.shape === 'rect') {
          return (
            <div
              key={p.id}
              className="absolute"
              style={{
                width: p.size * 1.5,
                height: p.size * 0.6,
                backgroundColor: p.color,
                borderRadius: 2,
                transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
                opacity: 0.9,
                willChange: 'transform, opacity',
              }}
            />
          )
        }

        // Star shape using CSS clip-path
        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`,
              opacity: 0.9,
              willChange: 'transform, opacity',
            }}
          />
        )
      })}
    </div>
  )
}
