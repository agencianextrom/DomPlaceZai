'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import { useTheme } from 'next-themes';

/** Diameter of the radial glow circle (px) */
const GLOW_SIZE = 400;

/**
 * Lerp interpolation factor — controls how quickly the glow catches up
 * to the cursor. Lower values produce a more noticeable trailing lag.
 */
const LERP_FACTOR = 0.15;

/**
 * Minimum position delta (px) before a React state update is triggered.
 * Prevents unnecessary re-renders when the glow has effectively settled.
 */
const MIN_DELTA = 0.5;

/** Spring transition configuration for framer-motion's `animate` prop. */
const SPRING_CONFIG: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 0.5,
  restSpeed: 0.5,
};

/**
 * Linear interpolation between two values.
 */
function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Returns whether the current environment supports the cursor glow:
 * - Hover-capable device (desktop / trackpad)
 * - User has not requested reduced motion
 */
function getGlowEligible(hoverMedia: MediaQueryList, reducedMotionMedia: MediaQueryList): boolean {
  return hoverMedia.matches && !reducedMotionMedia.matches;
}

/**
 * CursorGlow — A subtle, ambient radial gradient glow that follows the
 * mouse cursor across the viewport.
 *
 * Architecture:
 * - **RAF loop (imperative):** Runs a lerp interpolation each frame so
 *   the glow position trails slightly behind the actual cursor.
 * - **framer-motion `animate` (declarative):** Adds a spring-based
 *   smoothing layer on top of the lerped position for silky movement.
 *
 * Behaviour:
 * - Desktop only (detected via `hover: hover` media query).
 * - Respects `prefers-reduced-motion` — fully disabled when active.
 * - Glow fades off-screen when the cursor leaves the viewport.
 * - Adaptive opacity: `0.04` in light mode, `0.07` in dark mode.
 */
export default function CursorGlow() {
  // ── Client-only environment gate ────────────────────────────────────
  const [shouldRender, setShouldRender] = useState(false);

  // ── Animated position (lerped → fed into framer-motion animate) ────
  const [position, setPosition] = useState({
    x: -GLOW_SIZE,
    y: -GLOW_SIZE,
  });

  // ── Theme-aware opacity & color ──────────────────────────────────────
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // ── Imperative refs for the RAF interpolation loop ────────────────────
  const targetRef = useRef({ x: -GLOW_SIZE, y: -GLOW_SIZE });
  const currentRef = useRef({ x: -GLOW_SIZE, y: -GLOW_SIZE });
  const rafRef = useRef<number>(0);

  // ── Effect 1: Environment detection via media query subscriptions ────
  // The setState call lives inside the media query `change` callback,
  // satisfying the react-hooks/set-state-in-effect lint rule.
  useEffect(() => {
    const hoverMedia = window.matchMedia('(hover: hover)');
    const reducedMotionMedia = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    const handleMediaChange = () => {
      setShouldRender(getGlowEligible(hoverMedia, reducedMotionMedia));
    };

    hoverMedia.addEventListener('change', handleMediaChange);
    reducedMotionMedia.addEventListener('change', handleMediaChange);

    // Schedule initial evaluation asynchronously so the setState call
    // originates from the timer callback rather than the effect body.
    const initialTimer = setTimeout(handleMediaChange, 0);

    return () => {
      clearTimeout(initialTimer);
      hoverMedia.removeEventListener('change', handleMediaChange);
      reducedMotionMedia.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // ── Effect 2: Mouse tracking + RAF interpolation (depends on render) ─
  const onMouseMove = useCallback((e: MouseEvent) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseLeave = useCallback(() => {
    targetRef.current = { x: -GLOW_SIZE, y: -GLOW_SIZE };
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    // ── Passive mouse tracking (zero main-thread overhead) ────────────
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave, {
      passive: true,
    });

    // ── RAF interpolation loop ───────────────────────────────────────
    // Runs at the display's refresh rate (~60 fps). Each tick lerps the
    // current glow position toward the latest cursor target, creating
    // the characteristic trailing-lag effect.
    const tick = () => {
      const prev = currentRef.current;
      const target = targetRef.current;

      const lerpedX = lerp(prev.x, target.x, LERP_FACTOR);
      const lerpedY = lerp(prev.y, target.y, LERP_FACTOR);

      currentRef.current = { x: lerpedX, y: lerpedY };

      // Only push a React state update when the position has shifted
      // enough to be perceptible — avoids idle re-renders.
      const dx = Math.abs(lerpedX - prev.x);
      const dy = Math.abs(lerpedY - prev.y);

      if (dx > MIN_DELTA || dy > MIN_DELTA) {
        setPosition({ x: lerpedX, y: lerpedY });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // ── Cleanup ───────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [shouldRender, onMouseMove, onMouseLeave]);

  // ── Bail out on touch devices / when reduced-motion is preferred ─────
  if (!shouldRender) return null;

  // ── Adaptive glow styling based on active theme ─────────────────────
  // Uses the project's emerald/teal primary color in oklch color space
  const glowColor = isDark
    ? 'oklch(0.55 0.12 155)'
    : 'oklch(0.45 0.1 155)';
  const glowOpacity = isDark ? 0.07 : 0.04;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <motion.div
        animate={{
          x: position.x - GLOW_SIZE / 2,
          y: position.y - GLOW_SIZE / 2,
        }}
        transition={SPRING_CONFIG}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: GLOW_SIZE,
          height: GLOW_SIZE,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: glowOpacity,
          willChange: 'transform',
        }}
      />
    </motion.div>
  );
}
