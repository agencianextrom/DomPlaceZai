'use client'

import { useTypewriter } from '@/lib/use-typewriter'

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

export function TypewriterText({ text, speed = 50, delay = 500, className }: TypewriterTextProps) {
  const { displayText, isComplete } = useTypewriter({ text, speed, delay })

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
        <span className="inline-block w-[2px] h-[1em] bg-current ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  )
}
