'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const STAR_VALUES = [1, 2, 3, 4, 5] as const

type StarRatingProps = {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
  className?: string
  /** Accessible label for the group */
  label?: string
}

export function StarRating({
  value,
  onChange,
  size = 'md',
  className,
  label,
}: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const interactive = Boolean(onChange)
  const shown = hover || value
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'

  return (
    <div
      role={interactive ? 'group' : 'img'}
      aria-label={label ?? `${value} / 5`}
      className={cn('inline-flex items-center gap-0.5', className)}
      onMouseLeave={interactive ? () => setHover(0) : undefined}
    >
      {STAR_VALUES.map((star) => {
        const filled = star <= shown
        const starClass = cn(
          iconClass,
          filled
            ? 'fill-amber-400 text-amber-400'
            : 'fill-transparent text-[var(--nora-text-muted)] opacity-50',
        )

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
              onMouseEnter={() => setHover(star)}
              onClick={() => onChange!(star)}
              aria-label={`${star}`}
              aria-pressed={value === star}
            >
              <Star className={starClass} aria-hidden />
            </button>
          )
        }

        return <Star key={star} className={starClass} aria-hidden />
      })}
    </div>
  )
}
