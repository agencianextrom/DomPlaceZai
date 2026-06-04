'use client';

import { useRef, useState, useCallback, useEffect, type RefObject } from 'react';

export interface TiltConfig {
  /** Maximum tilt angle in degrees. Default: 8 */
  maxTilt?: number;
  /** Perspective distance in px. Default: 1000 */
  perspective?: number;
  /** Scale factor on hover. Default: 1.02 */
  scale?: number;
  /** Transition speed in ms. Default: 400 */
  speed?: number;
  /** Enable glare/shine effect. Default: true */
  glare?: boolean;
}

interface TiltTarget {
  rotateX: number;
  rotateY: number;
  scale: number;
  glareX: number;
  glareY: number;
}

export function use3dTilt(ref: RefObject<HTMLElement | null>, config?: TiltConfig) {
  const {
    maxTilt = 8,
    perspective = 1000,
    scale = 1.02,
    speed = 400,
    glare = true,
  } = config ?? {};

  const rafRef = useRef<number | null>(null);
  const currentRef = useRef<TiltTarget>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    glareX: 50,
    glareY: 50,
  });
  const targetRef = useRef<TiltTarget>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    glareX: 50,
    glareY: 50,
  });
  const animateRef = useRef<(() => void) | undefined>(undefined);

  const [transform, setTransform] = useState(
    `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`
  );

  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none' as const,
    opacity: 0,
    background:
      'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)',
    transition: `opacity ${speed}ms ease-out`,
    zIndex: 1,
  });

  const lerp = useCallback((a: number, b: number, t: number) => a + (b - a) * t, []);

  const scheduleFrame = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      animateRef.current?.();
    });
  }, []);

  useEffect(() => {
    const smoothing = 1 - Math.pow(1 - Math.min(1, 16 / speed), 3);

    animateRef.current = () => {
      const current = currentRef.current;
      const target = targetRef.current;

      current.rotateX = lerp(current.rotateX, target.rotateX, smoothing);
      current.rotateY = lerp(current.rotateY, target.rotateY, smoothing);
      current.scale = lerp(current.scale, target.scale, smoothing);
      current.glareX = lerp(current.glareX, target.glareX, smoothing);
      current.glareY = lerp(current.glareY, target.glareY, smoothing);

      setTransform(
        `perspective(${perspective}px) rotateX(${current.rotateX.toFixed(3)}deg) rotateY(${current.rotateY.toFixed(3)}deg) scale(${current.scale.toFixed(5)})`
      );

      if (glare) {
        setGlareStyle((prev) => ({
          ...prev,
          background: `radial-gradient(circle at ${current.glareX.toFixed(1)}% ${current.glareY.toFixed(1)}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)`,
        }));
      }

      const isSettled =
        Math.abs(current.rotateX - target.rotateX) < 0.001 &&
        Math.abs(current.rotateY - target.rotateY) < 0.001 &&
        Math.abs(current.scale - target.scale) < 0.0001;

      if (!isSettled) {
        rafRef.current = requestAnimationFrame(() => {
          animateRef.current?.();
        });
      }
    };
  }, [lerp, perspective, speed, glare]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      targetRef.current = {
        rotateX: -normY * maxTilt,
        rotateY: normX * maxTilt,
        scale,
        glareX: (x / rect.width) * 100,
        glareY: (y / rect.height) * 100,
      };

      if (glare) {
        setGlareStyle((prev) => ({ ...prev, opacity: 1 }));
      }

      scheduleFrame();
    },
    [ref, maxTilt, scale, glare, scheduleFrame]
  );

  const onMouseLeave = useCallback(() => {
    targetRef.current = {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      glareX: 50,
      glareY: 50,
    };

    if (glare) {
      setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
    }

    scheduleFrame();
  }, [glare, scheduleFrame]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { onMouseMove, onMouseLeave, transform, glareStyle };
}
