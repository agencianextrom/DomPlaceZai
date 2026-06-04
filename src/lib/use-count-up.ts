'use client';

import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';

export interface CountUpConfig {
  /** Target number to count up to */
  end: number;
  /** Animation duration in ms. Default: 1500 */
  duration?: number;
  /** Start animation only when element enters viewport. Default: true */
  startOnView?: boolean;
  /** Number of decimal places. Default: 0 */
  decimals?: number;
}

export function useCountUp({
  end,
  duration = 1500,
  startOnView = true,
  decimals = 0,
}: CountUpConfig) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const ref = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);

  const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  };

  const formatValue = useCallback(
    (v: number): number => {
      return parseFloat(v.toFixed(decimals));
    },
    [decimals]
  );

  // Pure animation logic — no setState calls so it can be invoked from effects safely.
  const runAnimation = useCallback(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = easedProgress * end;

      setValue(formatValue(currentValue));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(formatValue(end));
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [end, duration, formatValue]);

  useEffect(() => {
    if (!startOnView) {
      // Defer via microtask so setState is not called synchronously in the effect body.
      const id = setTimeout(() => {
        setHasStarted(true);
        runAnimation();
      }, 0);
      return () => clearTimeout(id);
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          runAnimation();
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [startOnView, runAnimation]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  /** Formatted number string using pt-BR locale */
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return { value, formatted, ref, hasStarted };
}
