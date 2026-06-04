'use client';

import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';

// ── Types ───────────────────────────────────────────────────────────────────

export interface FloatingParticlesProps {
  /** Number of particles to render. Default: 20 */
  count?: number;
  /** CSS color value for particles. Default: oklch(0.45 0.1 155) */
  color?: string;
  /** Maximum particle diameter in px. Default: 4 */
  maxSize?: number;
  /** Minimum particle diameter in px. Default: 1 */
  minSize?: number;
  /** Additional CSS class names for the container */
  className?: string;
}

interface ParticleData {
  id: number;
  /** Diameter in px */
  size: number;
  /** Left position as percentage (0–100) */
  x: number;
  /** Top position as percentage (0–100) */
  y: number;
  /** Base opacity (0.1–0.4) */
  opacity: number;
  /** Animation duration in seconds (8–20) */
  duration: number;
  /** Animation delay in seconds */
  delay: number;
  /** Movement variant: float-up, drift-diagonal, orbit */
  pattern: 'float-up' | 'drift-diagonal' | 'orbit';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Seeded pseudo-random number generator (simple mulberry32) */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick a random item from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Animation variants for each movement pattern */
const PATTERNS = ['float-up', 'drift-diagonal', 'orbit'] as const;

function getAnimationVariants(pattern: ParticleData['pattern']) {
  switch (pattern) {
    case 'float-up':
      return {
        initial: { y: 0, opacity: 0 },
        animate: {
          y: [-20, 20, -20],
          opacity: [0.15, 0.35, 0.15],
        },
      };
    case 'drift-diagonal':
      return {
        initial: { x: 0, y: 0, opacity: 0 },
        animate: {
          x: [-30, 20, -30],
          y: [-15, 25, -15],
          opacity: [0.1, 0.3, 0.1],
        },
      };
    case 'orbit':
      return {
        initial: { x: 0, y: 0, opacity: 0 },
        animate: {
          x: [-15, 15, 0, -15],
          y: [-15, 0, 15, -15],
          opacity: [0.2, 0.1, 0.3, 0.2],
        },
      };
  }
}

// ── Particle Component (memoized) ────────────────────────────────────────────

interface ParticleProps {
  data: ParticleData;
  color: string;
}

/**
 * Single particle — memoized so parent re-renders don't cause DOM thrash.
 * Uses framer-motion for GPU-accelerated CSS transforms.
 */
const Particle = memo(function Particle({ data, color }: ParticleProps) {
  const variants = getAnimationVariants(data.pattern);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: `${data.x}%`,
        top: `${data.y}%`,
        width: data.size,
        height: data.size,
        borderRadius: '50%',
        backgroundColor: color,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
      variants={variants}
      initial="initial"
      animate="animate"
      transition={{
        duration: data.duration,
        repeat: Infinity,
        delay: data.delay,
        ease: 'easeInOut',
      }}
    />
  );
});

// ── Container Component ─────────────────────────────────────────────────────

/**
 * FloatingParticles — a lightweight ambient particle system for section backgrounds.
 *
 * Renders `count` absolutely-positioned circles with randomised size, position,
 * opacity, and animation timing.  Three distinct movement patterns give variety:
 * floating upward, diagonal drift, and gentle orbital paths.
 *
 * - All particles use GPU-accelerated CSS transforms (via framer-motion).
 * - Particles are `pointer-events: none` and `aria-hidden`.
 * - Memoized at the particle level so parent re-renders cause zero DOM churn.
 * - Respects `prefers-reduced-motion` — particles remain visible but static.
 *
 * Usage:
 * ```tsx
 * <FloatingParticles count={30} color="oklch(0.55 0.12 155)" className="absolute inset-0" />
 * ```
 */
export function FloatingParticles({
  count = 20,
  color = 'oklch(0.45 0.1 155)',
  maxSize = 4,
  minSize = 1,
  className,
}: FloatingParticlesProps): React.JSX.Element {
  // Generate deterministic particle data once (stable across re-renders)
  const particles = useMemo<ParticleData[]>(() => {
    const rand = seededRandom(42); // Fixed seed for consistent layout
    const safeMin = Math.max(1, minSize);
    const safeMax = Math.max(safeMin, maxSize);

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: clamp(rand() * (safeMax - safeMin) + safeMin, safeMin, safeMax),
      x: rand() * 100,
      y: rand() * 100,
      opacity: rand() * 0.3 + 0.1,
      duration: rand() * 12 + 8, // 8–20s
      delay: rand() * -20,       // Stagger start across negative delay
      pattern: pick([...PATTERNS]),
    }));
  }, [count, minSize, maxSize]);

  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <Particle key={p.id} data={p} color={color} />
      ))}
    </div>
  );
}
