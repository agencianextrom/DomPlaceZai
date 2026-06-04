'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

export interface TextScrambleProps {
  /** The final text to reveal */
  text: string;
  /** Additional CSS class names */
  className?: string;
  /** Milliseconds per character reveal cycle. Default: 30 */
  speed?: number;
  /** Characters used for the scramble effect. Default: A-Z 0-9 @#$% */
  scrambleChars?: string;
  /** Start the effect when the element enters the viewport. Default: true */
  triggerOnView?: boolean;
}

interface CharState {
  /** The currently displayed character (scramble or final) */
  display: string;
  /** Whether the final character has been locked in */
  revealed: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Pick a random character from the scramble pool */
function randomScrambleChar(pool: string): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Generate a small random jitter factor (0.6–1.4) for stagger variation */
function randomJitter(): number {
  return 0.6 + Math.random() * 0.8;
}

// ── Component ───────────────────────────────────────────────────────────────

/**
 * TextScramble — reveals text character-by-character with a decode / cipher
 * scramble effect.
 *
 * Before each character is "decoded" it rapidly cycles through random
 * characters from `scrambleChars`.  Each character has a slightly staggered
 * delay so the reveal cascades across the string.
 *
 * - When `triggerOnView` is true, decoding starts only after the element
 *   enters the viewport (via IntersectionObserver).
 * - Respects `prefers-reduced-motion` — the full text appears instantly.
 * - Uses a monospace font during the scramble phase for stable widths.
 *
 * Usage:
 * ```tsx
 * <TextScramble text="Hello, World!" speed={25} />
 * ```
 */
export function TextScramble({
  text,
  className,
  speed = 30,
  scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%',
  triggerOnView = true,
}: TextScrambleProps): React.JSX.Element {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [chars, setChars] = useState<CharState[]>(
    () => text.split('').map(() => ({ display: '', revealed: false })),
  );
  const jitterFactors = useMemo(
    () => text.split('').map(() => randomJitter()),
    [text],
  );

  // ── Viewport trigger ───────────────────────────────────────────────────
  useEffect(() => {
    if (!triggerOnView) {
      setHasStarted(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // If user prefers reduced motion, start immediately (will skip animation)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [triggerOnView]);

  // ── Scramble / decode animation ────────────────────────────────────────
  const runDecode = useCallback(() => {
    // Respect prefers-reduced-motion: lock everything instantly
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
      setChars(text.split('').map((char) => ({ display: char, revealed: true })));
      return;
    }

    const totalChars = text.length;
    const revealTimers: ReturnType<typeof setTimeout>[] = [];

    // Pre-assign each character's reveal timestamp with jitter
    const revealTimes: number[] = text.split('').map((_, i) => i * speed * jitterFactors[i]);

    // Scramble interval — rapidly cycles unresolved characters
    const scrambleInterval = setInterval(() => {
      setChars((prev) =>
        prev.map((c, i) =>
          c.revealed ? c : { ...c, display: randomScrambleChar(scrambleChars) },
        ),
      );
    }, 50); // ~20 fps scramble rate

    // Schedule each character's reveal
    for (let i = 0; i < totalChars; i++) {
      const timer = setTimeout(() => {
        setChars((prev) =>
          prev.map((c, idx) =>
            idx === i ? { display: text[i], revealed: true } : c,
          ),
        );
      }, revealTimes[i]);

      revealTimers.push(timer);
    }

    // Clean up scramble interval after all characters are revealed
    const maxRevealTime = Math.max(...revealTimes, 0);
    const cleanupTimer = setTimeout(() => {
      clearInterval(scrambleInterval);
    }, maxRevealTime + 100);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(cleanupTimer);
      revealTimers.forEach(clearTimeout);
    };
  }, [text, speed, scrambleChars, jitterFactors]);

  useEffect(() => {
    if (!hasStarted) return;

    // Reset state before starting
    setChars(text.split('').map(() => ({ display: '', revealed: false })));

    const cleanup = runDecode();
    return () => cleanup?.();
  }, [hasStarted, text, runDecode]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <span
          key={`${i}-${char.revealed ? 1 : 0}`}
          style={{
            opacity: char.display ? 1 : 0,
            transition: 'opacity 0.1s ease',
            display: 'inline-block',
          }}
          aria-hidden="true"
        >
          {char.display}
        </span>
      ))}
      {/* Visually hidden accessible text for screen readers */}
      <span className="sr-only">{text}</span>
    </span>
  );
}
