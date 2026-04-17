'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  count?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const textSizeMap = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
}

export function StarRating({
  rating,
  size = 'md',
  showCount = false,
  count,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]
  const displayCount = count ?? Math.round(rating)

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const filled = star <= Math.floor(rating)
          const isHalf = !filled && star === Math.ceil(rating) && rating % 1 >= 0.3 && rating % 1 < 0.8
          const empty = !filled && !isHalf

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(star)}
              className={cn(
                'relative inline-flex items-center justify-center',
                interactive && 'cursor-pointer hover:scale-110 transition-transform'
              )}
              aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
            >
              {/* Empty star (background) */}
              <Star
                className={cn(
                  sizeMap[size],
                  'text-muted-foreground/30'
                )}
              />

              {/* Filled star (overlay) */}
              {(filled || isHalf) && (
                <div
                  className={cn('absolute inset-0 overflow-hidden', isHalf && 'w-[50%]')}
                >
                  <Star
                    className={cn(
                      sizeMap[size],
                      'text-amber-500 fill-amber-500'
                    )}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {showCount && (
        <span className={cn(textSizeMap[size], 'text-muted-foreground')}>
          ({displayCount})
        </span>
      )}
    </div>
  )
}
