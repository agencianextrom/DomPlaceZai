'use client';

import { useMemo, useCallback, useState, useEffect, type CSSProperties } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

export type KenBurnsDirection = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';

export interface KenBurnsProps {
  children: React.ReactNode;
  /** Seconds for one full animation cycle. Default: 20 */
  duration?: number;
  /** Animation direction. Default: 'zoom-in' */
  direction?: KenBurnsDirection;
  /** Pause the animation on hover. Default: true */
  pauseOnHover?: boolean;
  /** Additional CSS class names for the outer wrapper */
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build an inline `@keyframes` rule and inject it via a <style> element
 * so each KenBurns instance can have a unique duration without colliding.
 */
function getOrCreateKeyframes(
  name: string,
  direction: KenBurnsDirection,
): HTMLStyleElement | null {
  const id = `kb-${name}`;

  // Re-use if already injected
  let style = document.getElementById(id) as HTMLStyleElement | null;
  if (style) return style;

  style = document.createElement('style');
  style.id = id;

  let keyframes = '';

  switch (direction) {
    case 'zoom-in':
      keyframes = `
        @keyframes ${id} {
          0%   { transform: scale(1)   translate(0, 0); }
          100% { transform: scale(1.1) translate(-1.5%, -1%); }
        }
      `;
      break;
    case 'zoom-out':
      keyframes = `
        @keyframes ${id} {
          0%   { transform: scale(1.1) translate(-1.5%, -1%); }
          100% { transform: scale(1)   translate(0, 0); }
        }
      `;
      break;
    case 'pan-left':
      keyframes = `
        @keyframes ${id} {
          0%   { transform: scale(1.08) translate(2%, 0); }
          100% { transform: scale(1.08) translate(-2%, 0); }
        }
      `;
      break;
    case 'pan-right':
      keyframes = `
        @keyframes ${id} {
          0%   { transform: scale(1.08) translate(-2%, 0); }
          100% { transform: scale(1.08) translate(2%, 0); }
        }
      `;
      break;
  }

  style.textContent = keyframes;
  document.head.appendChild(style);
  return style;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * KenBurns — wraps children (typically an `<img>`) in an overflow-hidden
 * container and applies a slow zoom / pan animation for a cinematic feel.
 *
 * - Four direction presets: `zoom-in`, `zoom-out`, `pan-left`, `pan-right`.
 * - Seamless infinite loop via CSS animation with `alternate`.
 * - Pauses on hover when `pauseOnHover` is true.
 * - Respects `prefers-reduced-motion` (animation is disabled).
 *
 * Usage:
 * ```tsx
 * <KenBurns duration={25} direction="zoom-in">
 *   <img src="/hero.jpg" alt="Hero" className="w-full h-full object-cover" />
 * </KenBurns>
 * ```
 */
export function KenBurns({
  children,
  duration = 20,
  direction = 'zoom-in',
  pauseOnHover = true,
  className,
}: KenBurnsProps): React.JSX.Element {
  // Generate a stable unique animation name based on duration + direction
  const animName = useMemo(
    () => `kb-${direction}-${duration}`,
    [direction, duration],
  );

  // Track hover state for pause behavior
  const [isPaused, setIsPaused] = useState(false);

  // Track reduced-motion preference (lazy initializer avoids set-state-in-effect)
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Inject keyframes + subscribe to reduced-motion changes
  useEffect(() => {
    getOrCreateKeyframes(`${direction}-${duration}`, direction);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [direction, duration]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsPaused(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsPaused(false);
  }, [pauseOnHover]);

  const wrapperStyle: CSSProperties = {
    overflow: 'hidden',
    position: 'relative',
  };

  const innerStyle: CSSProperties = reducedMotion
    ? {
        // Static display when user prefers reduced motion
        width: '100%',
        height: '100%',
      }
    : {
        width: '100%',
        height: '100%',
        animationName: animName,
        animationDuration: `${duration}s`,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
        animationPlayState: isPaused ? 'paused' : 'running',
        willChange: 'transform',
      };

  return (
    <div
      className={className}
      style={wrapperStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={innerStyle}>{children}</div>
    </div>
  );
}
