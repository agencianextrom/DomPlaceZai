'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface TypewriterConfig {
  /** Full text to type out */
  text: string;
  /** Milliseconds per character. Default: 50 */
  speed?: number;
  /** Initial delay before typing starts in ms. Default: 500 */
  delay?: number;
  /** Callback when typing completes */
  onComplete?: () => void;
}

export function useTypewriter({ text, speed = 50, delay = 500, onComplete }: TypewriterConfig) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const animate = useCallback(() => {
    let index = 0;

    const interval = setInterval(() => {
      index++;

      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onCompleteRef.current?.();
      }
    }, speed);

    return interval;
  }, [text, speed]);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    const timeout = setTimeout(() => {
      const interval = animate();

      return () => {
        clearInterval(interval);
      };
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [text, delay, animate]);

  return { displayText, isComplete };
}
