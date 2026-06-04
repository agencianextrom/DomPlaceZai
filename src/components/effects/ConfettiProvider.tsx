'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

/**
 * Confetti context — provides a `triggerConfetti` function to fire bursts
 * at arbitrary (x, y) viewport coordinates.
 */
interface ConfettiContextValue {
  triggerConfetti: (x: number, y: number) => void;
}

const ConfettiContext = createContext<ConfettiContextValue | undefined>(undefined);

/**
 * Hook to access the confetti trigger function.
 * Must be used inside a `<ConfettiProvider>`.
 */
export function useConfetti(): ConfettiContextValue {
  const ctx = useContext(ConfettiContext);
  if (!ctx) {
    throw new Error('useConfetti must be used within a <ConfettiProvider>');
  }
  return ctx;
}

interface ConfettiProviderProps {
  children: ReactNode;
}

/**
 * Provider that sets up a fixed-position container covering the viewport.
 *
 * The container has `pointer-events: none` and a very high z-index so it
 * never interferes with user interaction. The actual particle rendering is
 * handled by `confetti.ts` — this component simply ensures the container
 * exists and exposes the trigger via React context.
 */
export function ConfettiProvider({ children }: ConfettiProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<((x: number, y: number) => void) | null>(null);

  // Lazy-load the confetti engine so it's only imported on the client
  useEffect(() => {
    import('@/lib/confetti').then(({ fireConfetti }) => {
      triggerRef.current = fireConfetti;
    });
  }, []);

  // Ensure the container is mounted in the DOM
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Pre-create the container that confetti.ts expects
    const existing = document.getElementById('confetti-container');
    if (!existing) {
      container.id = 'confetti-container';
    }

    return () => {
      // Clean up particles on unmount
      if (container.id === 'confetti-container') {
        container.id = '';
      }
    };
  }, []);

  const triggerConfetti = useCallback((x: number, y: number) => {
    if (triggerRef.current) {
      triggerRef.current(x, y);
    }
  }, []);

  return (
    <ConfettiContext.Provider value={{ triggerConfetti }}>
      {/* Fixed container covering the viewport — particles are rendered here */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      />
      {children}
    </ConfettiContext.Provider>
  );
}
