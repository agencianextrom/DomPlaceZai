'use client';

import { useRef, useEffect, useCallback, type RefObject } from 'react';

// ── Configuration ──────────────────────────────────────────────────────────

export interface MagneticOptions {
  /** Maximum pixel offset from center. Default: 30 */
  strength?: number;
  /** Activation radius in px — cursor within this distance triggers effect. Default: 200 */
  radius?: number;
  /** Lerp interpolation factor per frame. Higher = snappier. Default: 0.15 */
  smoothing?: number;
}

interface MagneticState {
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  isActive: boolean;
}

// ── Hook ────────────────────────────────────────────────────────────────────

/**
 * useMagnetic — makes an element magnetically attract toward the cursor
 * when hovering nearby, then spring back to origin on leave.
 *
 * Uses a RAF loop with lerp-based smoothing for buttery movement.
 * Respects `prefers-reduced-motion` (disabled when active).
 *
 * Usage:
 * ```tsx
 * const { ref, onMouseMove, onMouseLeave } = useMagnetic({ strength: 40 });
 * return <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>…</div>
 * ```
 */
export function useMagnetic(options?: MagneticOptions): {
  ref: RefObject<HTMLDivElement | null>;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
} {
  const {
    strength = 30,
    radius = 200,
    smoothing = 0.15,
  } = options ?? {};

  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<MagneticState>({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    isActive: false,
  });
  const reducedMotionRef = useRef(false);

  // Check reduced-motion preference once on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      // If motion is now reduced, snap element back to origin
      if (e.matches) {
        const el = ref.current;
        if (el) {
          el.style.transform = 'translate(0px, 0px)';
        }
        stateRef.current.currentX = 0;
        stateRef.current.currentY = 0;
        stateRef.current.targetX = 0;
        stateRef.current.targetY = 0;
        stateRef.current.isActive = false;
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // RAF animation loop — lerps current toward target each frame
  useEffect(() => {
    const tick = () => {
      const state = stateRef.current;
      const el = ref.current;

      if (state.isActive || Math.abs(state.currentX) > 0.1 || Math.abs(state.currentY) > 0.1) {
        state.currentX += (state.targetX - state.currentX) * smoothing;
        state.currentY += (state.targetY - state.currentY) * smoothing;

        // Snap to zero when very close to settle (prevents floating-point drift)
        if (Math.abs(state.currentX) < 0.05 && Math.abs(state.currentY) < 0.05 && !state.isActive) {
          state.currentX = 0;
          state.currentY = 0;
        }

        if (el) {
          el.style.transform = `translate(${state.currentX.toFixed(2)}px, ${state.currentY.toFixed(2)}px)`;
        }

        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Fully settled — clean up
        if (el) {
          el.style.transform = 'translate(0px, 0px)';
        }
        rafRef.current = null;
      }
    };

    // Start the loop once; it self-terminates when settled
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [smoothing]);

  /** Calculate offset from element center and set new target */
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reducedMotionRef.current) return;

      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only activate within the configured radius
      if (distance > radius) return;

      const factor = 1 - distance / radius; // 1 at center, 0 at edge
      const normX = distance > 0 ? dx / distance : 0;
      const normY = distance > 0 ? dy / distance : 0;

      stateRef.current.targetX = normX * strength * factor;
      stateRef.current.targetY = normY * strength * factor;
      stateRef.current.isActive = true;

      // Kick the RAF loop if it was idle
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {});
      }
    },
    [strength, radius],
  );

  /** Spring back to origin */
  const onMouseLeave = useCallback(() => {
    stateRef.current.targetX = 0;
    stateRef.current.targetY = 0;
    stateRef.current.isActive = false;

    // Kick the RAF loop for the settle-back animation
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {});
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
