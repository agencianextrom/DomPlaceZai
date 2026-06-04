'use client';

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type RefObject,
} from 'react';
import { motion } from 'framer-motion';

// ── Configuration ──────────────────────────────────────────────────────────

export interface ScrollRevealOptions {
  /** Intersection ratio at which reveal triggers. Default: 0.15 */
  threshold?: number;
  /** Observer root margin. Default: '0px 0px -50px 0px' */
  rootMargin?: string;
  /** Disconnect observer after first reveal. Default: true */
  triggerOnce?: boolean;
}

// ── Hook ────────────────────────────────────────────────────────────────────

/**
 * useScrollReveal — attaches an IntersectionObserver to a ref'd element
 * and toggles a `revealed` CSS class when it enters / leaves the viewport.
 *
 * - Adds the class `revealed` on first intersection.
 * - When `triggerOnce` is true the observer disconnects immediately after.
 * - When `triggerOnce` is false the class is removed when the element exits.
 * - Passively observed, respects `prefers-reduced-motion` (instant reveal).
 */
export function useScrollReveal(options?: ScrollRevealOptions): RefObject<HTMLDivElement | null> {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options ?? {};

  const ref = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If user prefers reduced motion, reveal immediately
    if (reducedMotionRef.current) {
      element.classList.add('revealed');
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');

            if (triggerOnce) {
              observerRef.current?.disconnect();
            }
          } else if (!triggerOnce) {
            entry.target.classList.remove('revealed');
          }
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return ref;
}

// ── Component Wrapper ───────────────────────────────────────────────────────

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in seconds — useful for animating sibling items sequentially */
  delay?: number;
}

/**
 * ScrollReveal — declarative wrapper that combines `useScrollReveal`
 * with a framer-motion `whileInView` animation for opacity + translateY.
 *
 * Usage:
 * ```tsx
 * <ScrollReveal delay={0.2}>
 *   <Card />
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
  children,
  className,
  delay,
}: ScrollRevealProps): React.JSX.Element {
  const ref = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      className={`reveal-up ${className ?? ''}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: delay ?? 0,
      }}
    >
      {children}
    </motion.div>
  );
}
